import { db } from '@/db'
import { Transaction } from '@/db/_types'
import { refreshTokens, users, Users } from '@/db/schema'
import { AppError } from '@/errors/app.error'
import { signAccessToken } from '@/lib/jwt'
import { hash, argon2id, verify } from 'argon2'
import { randomBytes, createHash } from 'crypto'
import { eq } from 'drizzle-orm'

type RegisterNewUserInput = {
  name: string
  email: string
  password: string
}

type RegisterNewUserResult = {
  id: Users['id']
  name: Users['name']
  email: Users['email']
  createdAt: Users['createdAt']
}

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`User with the email "'${email}'" already exists`, 409, 'USER_ALREADY_EXISTS')
  }
}

export async function registerNewUser(input: RegisterNewUserInput): Promise<RegisterNewUserResult> {
  // Check if user with provided email already exist
  const existing = await db.query.users.findFirst({
    where: (u) => eq(u.email, input.email),
  })

  // If yes throw error
  if (existing) throw new UserAlreadyExistsError(input.email)
  // If not continue

  // Create password hash using argon2
  const passwordHash = await hash(input.password, {
    type: argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  })

  // Insert user data to database and get returning data
  const [userData] = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })

  return userData
}

async function createRefreshToken(userId: Users['id'], tx?: Transaction): Promise<string> {
  const client = tx ?? db

  // Create refresh token
  const refreshToken = randomBytes(64).toString('hex')
  const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) //30 days

  // Store refresh token hash in database
  await client.insert(refreshTokens).values({
    userId: userId,
    refreshTokenHash,
    expiresAt,
  })

  return refreshToken
}

type LoginUserResult = {
  refreshToken: string
  accessToken: string
  user: Pick<Users, 'id' | 'name' | 'email'>
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid credentials', 401, 'INVALID_CREDENTIALS')
  }
}

export async function loginUser(email: Users['email'], password: string): Promise<LoginUserResult> {
  // Find user based on email
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  })

  if (!user) throw new InvalidCredentialsError()

  // Verify password
  const credentials_ok = await verify(user.passwordHash, password)
  if (!credentials_ok) throw new InvalidCredentialsError()

  // Create access token
  const accessToken = await signAccessToken(user.id)

  // Create refresh token
  const refreshToken = await createRefreshToken(user.id)

  return {
    refreshToken,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  }
}

type RefreshAccessTokenResult = {
  refreshToken: string
  accessToken: string
}

export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid Token', 401, 'INVALID_TOKEN')
  }
}

export class TokenRevokedError extends AppError {
  constructor() {
    super('Token Revoked', 401, 'TOKEN_REVOKED')
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token Expired', 401, 'TOKEN_EXPIRED')
  }
}

export class TokenReuseDetectedError extends AppError {
  constructor() {
    super('Token Reuse Detected', 401, 'TOKEN_REUSE_DETECTED')
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenResult> {
  const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex')

  const storedToken = await db.query.refreshTokens.findFirst({
    where: (rt, { eq }) => eq(rt.refreshTokenHash, refreshTokenHash),
  })

  // Check if the token provided exist in our database
  if (!storedToken) throw new InvalidTokenError()

  // Check if it already revoked
  if (storedToken.revokedAt) new TokenRevokedError()

  // Check if it expired
  if (storedToken.expiresAt < new Date()) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id))

    throw new TokenExpiredError()
  }

  // Check if it already used
  if (storedToken.usedAt) {
    // If yes revoke all user's refresh tokens
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, storedToken.userId))

    throw new TokenReuseDetectedError()
  }

  const newAccessToken = await signAccessToken(storedToken.userId)

  const newRefreshToken = await db.transaction(async (tx) => {
    const newRefreshToken = await createRefreshToken(storedToken.userId, tx)

    await tx
      .update(refreshTokens)
      .set({ usedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id))

    return newRefreshToken
  })

  return { refreshToken: newRefreshToken, accessToken: newAccessToken }
}

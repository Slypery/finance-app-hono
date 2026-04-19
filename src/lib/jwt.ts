import { SignJWT, jwtVerify } from 'jose'
import { JWT_SECRET } from '@/env'

const secret = new TextEncoder().encode(JWT_SECRET)

export async function signAccessToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export type AccessTokenPayload = {
  userId: string
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as AccessTokenPayload
}

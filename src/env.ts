import "dotenv/config"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing env var: ${name}`)
  }
  return value
}

export const DATABASE_URL = requireEnv("DATABASE_URL")
export const JWT_SECRET = requireEnv("JWT_SECRET")
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import path from 'path'

/**
 * Resolve the Postgres connection URL.
 *
 * Priority:
 *  1. Any postgres:// URL already in the environment (DATABASE_URL / POSTGRES_URL).
 *  2. A postgres:// URL from the local .env file — this guards against hosts that
 *     export a non-postgres placeholder (e.g. `file:…` for SQLite) which would
 *     otherwise shadow the real connection string.
 *  3. Empty string → Prisma falls back to the schema's env("DATABASE_URL").
 */
function resolveDbUrl(): string {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL]
  for (const url of candidates) {
    if (url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
      return url
    }
  }

  try {
    const envFile = readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    const match = envFile.match(/^DATABASE_URL="?((?:postgres(?:ql)?:\/\/)[^"\n]+)"?/m)
    if (match) return match[1]
  } catch {
    // no .env file (e.g. production) — that's fine
  }

  return ''
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const url = resolveDbUrl()
  return url
    ? new PrismaClient({ datasources: { db: { url } } })
    : new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

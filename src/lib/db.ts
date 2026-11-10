import { PrismaClient } from '@prisma/client'

/**
 * Resolve the Postgres connection URL.
 * Some hosts inject a non-postgres DATABASE_URL; prefer any postgres:// URL available.
 */
function resolveDbUrl(): string {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL]
  for (const url of candidates) {
    if (url && (url.startsWith('postgres://') || url.startsWith('postgresql://'))) {
      return url
    }
  }
  return ''
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDbUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

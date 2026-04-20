import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

const connectionString = process.env.DIRECT_URL

// 1. On configure le Pool Postgres (nécessaire pour l'adapter)
const pool = new Pool({ connectionString })

// 2. On configure l'adapter Prisma
// C'est lui qui va traduire les requêtes Prisma en SQL optimisé pour le serverless
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 3. On initialise le client avec l'adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
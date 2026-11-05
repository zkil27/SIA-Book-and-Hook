import { PrismaClient } from '@prisma/client'

// Opt-in SQL logging for performance work: set PRISMA_LOG=query to print every
// statement Prisma sends (off by default; never enable it in production).
const prismaClientSingleton = () => {
  return new PrismaClient(process.env.PRISMA_LOG === 'query' ? { log: ['query'] } : undefined)
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

// lib/prisma.ts

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from './generated/prisma';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Shared pool using runtime DATABASE_URL (pooled Supabase string)
const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,               // Required for Prisma 7 Rust-free engine
    log: ['query'],        // Optional: remove in prod
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
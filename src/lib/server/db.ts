import { DATABASE_URL } from '$app/env/private';
import { dev } from '$app/env';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

// Reuse one client across HMR reloads in dev to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

if (dev) globalForPrisma.prisma = db;

export type { User, UserRole } from './generated/prisma/client';

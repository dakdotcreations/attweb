// Seeds the first ADMIN user. There is no public registration, so this is the
// only way the first account can exist. Safe to re-run (upsert by email).
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/lib/server/generated/prisma/client.ts';

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const name = process.env.SEED_ADMIN_NAME?.trim() || 'Administrator';

if (!email) {
	console.error('SEED_ADMIN_EMAIL is not set. Add it to .env and re-run `pnpm db:seed`.');
	process.exit(1);
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

try {
	const user = await prisma.user.upsert({
		where: { email },
		update: { role: 'ADMIN' },
		create: { id: randomUUID(), email, name, role: 'ADMIN', emailVerified: true }
	});
	console.log(`Admin ready: ${user.email} (${user.role})`);
} finally {
	await prisma.$disconnect();
}

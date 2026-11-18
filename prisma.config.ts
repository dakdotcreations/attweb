import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts'
	},
	datasource: {
		// Read leniently so `prisma generate` works without a database (fresh clone, CI).
		// Commands that need a DB (migrate, seed, studio) fail clearly if it's missing.
		url: process.env.DATABASE_URL ?? ''
	}
});

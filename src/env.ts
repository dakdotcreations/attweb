// SvelteKit 3 environment variable definitions.
// Private vars are imported from `$app/env/private` (server-only).
// Keep in sync with `.env.example`.
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const required = z.string().min(1);

export const variables = defineEnvVars({
	DATABASE_URL: {
		schema: required,
		description: 'PostgreSQL connection string (Railway)'
	},
	BETTER_AUTH_SECRET: {
		schema: z.string().min(32),
		description: 'Secret used by better-auth to sign sessions (min 32 chars)'
	},
	BETTER_AUTH_URL: {
		schema: z.url(),
		description: 'Public base URL of the app, e.g. http://localhost:5173'
	},
	SMTP_HOST: { schema: required, description: 'SMTP server host' },
	SMTP_PORT: {
		schema: z.string().default('587').transform(Number).pipe(z.number().int().positive()),
		description: 'SMTP port (587 for STARTTLS, 465 for TLS)'
	},
	SMTP_SECURE: {
		schema: z
			.enum(['true', 'false'])
			.default('false')
			.transform((v) => v === 'true'),
		description: '"true" for port 465 (implicit TLS), otherwise "false"'
	},
	SMTP_USER: { schema: required, description: 'SMTP username' },
	SMTP_PASS: { schema: required, description: 'SMTP password' },
	SMTP_FROM: {
		schema: required,
		description: 'From header for outgoing mail, e.g. "Altura Tours <no-reply@altura.example>"'
	},
	AZURE_STORAGE_CONNECTION_STRING: {
		schema: required,
		description: 'Azure Storage account connection string (Access keys → Connection string)'
	},
	AZURE_STORAGE_CONTAINER: {
		schema: z.string().regex(/^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$/, 'Invalid Azure container name'),
		description: 'Blob container for media; created with public blob read access if missing'
	},
	AZURE_STORAGE_PUBLIC_URL: {
		schema: z
			.union([z.literal(''), z.url()])
			.optional()
			.transform((v) => v?.replace(/\/+$/, '') || undefined),
		description: 'Optional public base URL (CDN / custom domain) for blobs, no trailing slash'
	}
});

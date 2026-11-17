import { z } from 'zod';
import { mediaIdSchema, publishStatusSchema, requiredText, sortOrderSchema } from './common.js';

/** A team member shown on the About page. */
export const teamMemberSchema = z.object({
	name: requiredText(80, 'Name'),
	role: requiredText(80, 'Role'),
	photoId: mediaIdSchema,
	/** Optional; the About page falls back to the company WhatsApp number. */
	whatsapp: z
		.string()
		.trim()
		.max(30, 'Number is too long')
		.refine((v) => v === '' || /^\+?[\d\s()-]{7,}$/.test(v), 'Enter a phone number, e.g. +256 700 000000')
		.transform((v) => v || null),
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type TeamMemberInput = z.input<typeof teamMemberSchema>;
export type TeamMemberData = z.output<typeof teamMemberSchema>;

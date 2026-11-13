import { z } from 'zod';
import { mediaIdSchema, publishStatusSchema, requiredText, sortOrderSchema } from './common.js';

/** A study abroad partner institution students can choose on the request form. */
export const institutionSchema = z.object({
	name: requiredText(150, 'Name'),
	country: requiredText(80, 'Country'),
	logoId: mediaIdSchema,
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type InstitutionInput = z.input<typeof institutionSchema>;
export type InstitutionData = z.output<typeof institutionSchema>;

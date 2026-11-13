import { SERVICE_FORM_TYPES } from '#lib/inquiries.js';
import { slugSchema } from '#lib/slug.js';
import { z } from 'zod';
import {
	mediaIdSchema,
	optionalText,
	publishStatusSchema,
	requiredText,
	richTextSchema,
	seoSchema,
	sortOrderSchema
} from './common.js';

export const serviceSchema = z.object({
	name: requiredText(120, 'Name'),
	slug: slugSchema,
	summary: optionalText(300, 'Summary'),
	content: richTextSchema,
	coverImageId: mediaIdSchema,
	status: publishStatusSchema,
	sortOrder: sortOrderSchema,
	formType: z.enum(SERVICE_FORM_TYPES),
	...seoSchema
});

export type ServiceInput = z.input<typeof serviceSchema>;
export type ServiceData = z.output<typeof serviceSchema>;

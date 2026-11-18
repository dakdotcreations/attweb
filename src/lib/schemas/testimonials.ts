import { z } from 'zod';
import {
	mediaIdSchema,
	nullableText,
	publishStatusSchema,
	requiredText,
	sortOrderSchema
} from './common.js';

export const testimonialSchema = z.object({
	name: requiredText(120, 'Name'),
	location: nullableText(120, 'Location'),
	quote: requiredText(2000, 'Quote'),
	rating: z.number().int().min(1).max(5).nullable(),
	photoId: mediaIdSchema,
	serviceId: z.string().min(1).nullable(),
	packageId: z.string().min(1).nullable(),
	featured: z.boolean(),
	status: publishStatusSchema,
	sortOrder: sortOrderSchema
});

export type TestimonialInput = z.input<typeof testimonialSchema>;
export type TestimonialData = z.output<typeof testimonialSchema>;

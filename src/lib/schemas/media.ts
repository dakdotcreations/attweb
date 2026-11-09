import { z } from 'zod';

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((v) => v || null);

export const mediaUpdateSchema = z.object({
	id: z.string().min(1),
	alt: z.string().trim().max(300, 'Alt text must be 300 characters or fewer'),
	caption: optionalText(500),
	showInGallery: z.boolean(),
	galleryCategory: optionalText(60)
});

export const mediaListQuerySchema = z.object({
	q: z.string().trim().max(100).optional().catch(undefined),
	gallery: z
		.enum(['1'])
		.optional()
		.catch(undefined)
		.transform((v) => v === '1'),
	page: z.coerce.number().int().min(1).optional().catch(undefined)
});

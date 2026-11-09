import { z } from 'zod';

/** Trimmed text where empty means null. */
export const nullableText = (max: number, label = 'This field') =>
	z
		.string()
		.trim()
		.max(max, `${label} must be ${max} characters or fewer`)
		.transform((v) => v || null);

export const requiredText = (max: number, label: string) =>
	z.string().trim().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`);

export const optionalText = (max: number, label = 'This field') =>
	z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

export const publishStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);

export const sortOrderSchema = z.number().int('Use a whole number').min(0).max(9999);

export const mediaIdSchema = z.string().min(1).nullable();

/** Rich text HTML from the editor (sanitized on the server before saving). */
export const richTextSchema = z.string().max(200_000, 'Content is too long');

export const seoSchema = {
	seoTitle: nullableText(70, 'SEO title'),
	seoDescription: nullableText(160, 'SEO description')
};

export type PublishStatus = z.infer<typeof publishStatusSchema>;

import { z } from 'zod';

/** "Gorilla Trekking – Bwindi (3 Days)" → "gorilla-trekking-bwindi-3-days" */
export function slugify(text: string) {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/g, '');
}

export const slugSchema = z
	.string()
	.trim()
	.min(1, 'Slug is required')
	.max(80, 'Slug must be 80 characters or fewer')
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens');

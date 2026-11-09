import { slugSchema } from '#lib/slug.js';
import { z } from 'zod';
import {
	mediaIdSchema,
	optionalText,
	publishStatusSchema,
	requiredText,
	richTextSchema,
	seoSchema
} from './common.js';

export const blogPostSchema = z.object({
	title: requiredText(150, 'Title'),
	slug: slugSchema,
	excerpt: optionalText(300, 'Excerpt'),
	content: richTextSchema,
	coverImageId: mediaIdSchema,
	serviceId: z.string().min(1).nullable(),
	status: publishStatusSchema,
	...seoSchema
});

export type BlogPostInput = z.input<typeof blogPostSchema>;
export type BlogPostData = z.output<typeof blogPostSchema>;

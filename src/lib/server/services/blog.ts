import type { BlogPostData } from '#lib/schemas/blog.js';
import { db } from '../db.js';
import type { Prisma } from '../generated/prisma/client.js';
import { sanitizeRichText } from '../sanitize.js';
import { mediaRefSelect } from './services.js';

export function listBlogPosts(params: { q?: string; status?: 'DRAFT' | 'PUBLISHED' } = {}) {
	const q = params.q?.trim();
	const where: Prisma.BlogPostWhereInput = {
		...(params.status ? { status: params.status } : {}),
		...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
	};
	return db.blogPost.findMany({
		where,
		orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }, { updatedAt: 'desc' }],
		select: {
			id: true,
			title: true,
			slug: true,
			status: true,
			publishedAt: true,
			updatedAt: true,
			coverImage: { select: mediaRefSelect },
			author: { select: { name: true, email: true } },
			service: { select: { name: true } }
		}
	});
}

export function getBlogPost(id: string) {
	return db.blogPost.findUnique({
		where: { id },
		include: {
			coverImage: { select: mediaRefSelect },
			author: { select: { name: true, email: true } }
		}
	});
}

export async function saveBlogPost(id: string | null, data: BlogPostData, userId: string) {
	const values = { ...data, content: sanitizeRichText(data.content) };

	if (!id) {
		return db.blogPost.create({
			data: {
				...values,
				authorId: userId,
				publishedAt: values.status === 'PUBLISHED' ? new Date() : null
			},
			select: { id: true }
		});
	}

	// publishedAt is stamped the first time a post goes live and kept afterwards,
	// so unpublishing and republishing doesn't change the article date.
	const existing = await db.blogPost.findUniqueOrThrow({ where: { id }, select: { publishedAt: true } });
	return db.blogPost.update({
		where: { id },
		data: {
			...values,
			publishedAt: existing.publishedAt ?? (values.status === 'PUBLISHED' ? new Date() : null)
		},
		select: { id: true }
	});
}

export function deleteBlogPost(id: string) {
	return db.blogPost.delete({ where: { id } });
}

/** Latest published posts for public listings. */
export function listLatestPosts(take = 3) {
	return db.blogPost.findMany({
		where: { status: 'PUBLISHED', publishedAt: { not: null } },
		orderBy: { publishedAt: 'desc' },
		take,
		select: {
			id: true,
			title: true,
			slug: true,
			excerpt: true,
			publishedAt: true,
			coverImage: { select: { url: true, thumbUrl: true, alt: true } },
			service: { select: { name: true } }
		}
	});
}

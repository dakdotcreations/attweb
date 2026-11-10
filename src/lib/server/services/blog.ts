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

// ---------------------------------------------------------------------------
// Public website
// ---------------------------------------------------------------------------

/** A post the public can see: published, with a publish date. */
const livePost = { status: 'PUBLISHED', publishedAt: { not: null } } satisfies Prisma.BlogPostWhereInput;

/** Card fields for public post lists (BlogCard). */
const publicPostCardSelect = {
	id: true,
	title: true,
	slug: true,
	excerpt: true,
	publishedAt: true,
	coverImage: { select: { url: true, thumbUrl: true, alt: true } },
	service: { select: { name: true, slug: true, status: true } }
} satisfies Prisma.BlogPostSelect;

/** Hide the topic label when the linked service isn't published. */
function withPublicService<T extends { service: { name: string; slug: string; status: string } | null }>(post: T) {
	const { service, ...rest } = post;
	return { ...rest, service: service?.status === 'PUBLISHED' ? { name: service.name, slug: service.slug } : null };
}

export const BLOG_PAGE_SIZE = 9;

/** Latest published posts for public listings. */
export async function listLatestPosts(take = 3) {
	const posts = await db.blogPost.findMany({
		where: livePost,
		orderBy: { publishedAt: 'desc' },
		take,
		select: publicPostCardSelect
	});
	return posts.map(withPublicService);
}

/** Paginated public blog listing, optionally limited to one published service. */
export async function listPublishedPosts(params: { serviceSlug?: string; page?: number } = {}) {
	const where: Prisma.BlogPostWhereInput = {
		...livePost,
		...(params.serviceSlug ? { service: { slug: params.serviceSlug, status: 'PUBLISHED' } } : {})
	};
	const total = await db.blogPost.count({ where });
	const pageCount = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
	const page = Math.min(Math.max(1, params.page ?? 1), pageCount);
	const posts = await db.blogPost.findMany({
		where,
		orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
		skip: (page - 1) * BLOG_PAGE_SIZE,
		take: BLOG_PAGE_SIZE,
		select: publicPostCardSelect
	});
	return { posts: posts.map(withPublicService), total, page, pageCount };
}

/** Published services that have at least one live post (blog topic filter). */
export function listBlogTopics() {
	return db.service.findMany({
		where: { status: 'PUBLISHED', blogPosts: { some: livePost } },
		orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
		select: { id: true, name: true, slug: true }
	});
}

/** Rough reading time from sanitized HTML, at ~220 words per minute. */
function readingMinutes(html: string) {
	const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

/** Public article page: the live post plus up to 3 related posts (same service first). */
export async function getPublicPost(slug: string) {
	const found = await db.blogPost.findFirst({
		where: { slug, ...livePost },
		select: {
			id: true,
			title: true,
			slug: true,
			excerpt: true,
			content: true,
			publishedAt: true,
			updatedAt: true,
			seoTitle: true,
			seoDescription: true,
			coverImage: { select: { url: true, alt: true } },
			author: { select: { name: true } },
			service: { select: { id: true, name: true, slug: true, summary: true, status: true } }
		}
	});
	if (!found) return null;

	const { service: rawService, ...rest } = found;
	const service = rawService?.status === 'PUBLISHED' ? rawService : null;
	const post = { ...rest, service, readingMinutes: readingMinutes(found.content) };

	const sameService = service
		? await db.blogPost.findMany({
				where: { ...livePost, serviceId: service.id, id: { not: post.id } },
				orderBy: { publishedAt: 'desc' },
				take: 3,
				select: publicPostCardSelect
			})
		: [];
	const others =
		sameService.length < 3
			? await db.blogPost.findMany({
					where: { ...livePost, id: { notIn: [post.id, ...sameService.map((p) => p.id)] } },
					orderBy: { publishedAt: 'desc' },
					take: 3 - sameService.length,
					select: publicPostCardSelect
				})
			: [];

	return { post, related: [...sameService, ...others].map(withPublicService) };
}

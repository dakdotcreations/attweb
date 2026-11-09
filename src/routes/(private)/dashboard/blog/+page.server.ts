import { requireUser } from '#lib/server/guards.js';
import { listBlogPosts } from '#lib/server/services/blog.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	requireUser();
	const q = url.searchParams.get('q')?.slice(0, 100) || undefined;
	const statusParam = url.searchParams.get('status');
	const status = statusParam === 'DRAFT' || statusParam === 'PUBLISHED' ? statusParam : undefined;
	return { posts: await listBlogPosts({ q, status }), q: q ?? '', status: status ?? '' };
};

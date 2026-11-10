import { listBlogTopics, listPublishedPosts } from '#lib/server/services/blog.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const topics = await listBlogTopics();
	// Unknown topics fall back to all posts instead of an empty page.
	const requested = url.searchParams.get('topic');
	const topic = topics.some((t) => t.slug === requested) ? requested! : undefined;
	const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;

	return {
		topics,
		activeTopic: topic ?? '',
		...(await listPublishedPosts({ serviceSlug: topic, page }))
	};
};

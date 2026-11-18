import { getPublicPost } from '#lib/server/services/blog.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const result = await getPublicPost(params.slug);
	if (!result) error(404, 'This article could not be found.');
	return { ...result, overHero: result.post.coverImage != null };
};

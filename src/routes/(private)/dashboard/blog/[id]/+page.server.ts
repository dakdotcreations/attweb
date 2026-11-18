import { blogPostSchema } from '#lib/schemas/blog.js';
import {
	formFailure,
	isForeignKeyViolation,
	isNotFound,
	isUniqueViolation,
	parseJsonPayload
} from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { deleteBlogPost, getBlogPost, saveBlogPost } from '#lib/server/services/blog.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const [post, services] = await Promise.all([
		params.id === 'new' ? null : getBlogPost(params.id),
		listServiceOptions()
	]);
	if (params.id !== 'new' && !post) error(404, 'Post not found');
	return { post, services };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const user = requireUser();
		const parsed = await parseJsonPayload(request, blogPostSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveBlogPost(isNew ? null : params.id, parsed.data, user.id));
		} catch (err) {
			if (isUniqueViolation(err, 'slug')) return formFailure({ slug: 'Another post already uses this slug.' });
			if (isForeignKeyViolation(err)) {
				return formFailure({}, 'A selected image or service no longer exists. Reload the page and try again.');
			}
			if (isNotFound(err)) error(404, 'Post not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/blog/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteBlogPost(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/blog');
	}
};

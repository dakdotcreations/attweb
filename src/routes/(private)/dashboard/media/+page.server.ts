import { mediaListQuerySchema, mediaUpdateSchema } from '#lib/schemas/media.js';
import { requireUser } from '#lib/server/guards.js';
import {
	deleteMedia,
	listGalleryCategories,
	listMedia,
	updateMedia
} from '#lib/server/services/media.js';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	requireUser();
	const query = mediaListQuerySchema.parse(Object.fromEntries(url.searchParams));
	const [result, categories] = await Promise.all([
		listMedia({ q: query.q, galleryOnly: query.gallery, page: query.page }),
		listGalleryCategories()
	]);
	return { ...result, categories, q: query.q ?? '', galleryOnly: query.gallery };
};

export const actions: Actions = {
	update: async ({ request }) => {
		requireUser();
		const form = await request.formData();
		const parsed = mediaUpdateSchema.safeParse({
			id: form.get('id'),
			alt: form.get('alt') ?? '',
			caption: form.get('caption') ?? '',
			showInGallery: form.get('showInGallery') === 'on',
			galleryCategory: form.get('galleryCategory') ?? ''
		});
		if (!parsed.success) {
			return fail(400, { action: 'update' as const, error: parsed.error.issues[0].message });
		}
		const { id, ...data } = parsed.data;
		try {
			await updateMedia(id, data);
		} catch (err) {
			console.error('Media update failed', err);
			return fail(500, { action: 'update' as const, error: 'Could not save changes.' });
		}
		return { action: 'update' as const, success: true };
	},

	delete: async ({ request }) => {
		requireUser();
		const id = String((await request.formData()).get('id') ?? '');
		if (!id) return fail(400, { action: 'delete' as const, error: 'Missing image id.' });
		try {
			await deleteMedia(id);
		} catch (err) {
			console.error('Media delete failed', err);
			return fail(500, { action: 'delete' as const, error: 'Could not delete this image.' });
		}
		return { action: 'delete' as const, success: true };
	}
};

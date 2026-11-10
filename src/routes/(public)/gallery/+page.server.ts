import { listGalleryPhotos, listPublicGalleryCategories } from '#lib/server/services/media.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categories = await listPublicGalleryCategories();
	// Unknown categories fall back to all photos instead of an empty page.
	const requested = url.searchParams.get('category');
	const category = requested && categories.includes(requested) ? requested : undefined;
	const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;

	return {
		categories,
		activeCategory: category ?? '',
		...(await listGalleryPhotos({ category, page }))
	};
};

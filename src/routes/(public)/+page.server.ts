import { listPublishedPackages } from '#lib/server/services/packages.js';
import { listGalleryPhotos } from '#lib/server/services/media.js';
import { listPublishedServices } from '#lib/server/services/services.js';
import { listPublishedTestimonials } from '#lib/server/services/testimonials.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [journeys, servicesWithCovers, testimonials, gallery] = await Promise.all([
		listPublishedPackages({ take: 5 }),
		listPublishedServices(),
		listPublishedTestimonials(3),
		listGalleryPhotos({ page: 1 })
	]);
	return {
		journeys,
		servicesWithCovers,
		testimonials,
		albumPhotos: gallery.photos.slice(0, 7),
		// Full-bleed hero: the header starts transparent over it.
		overHero: true
	};
};

import { listLatestPosts } from '#lib/server/services/blog.js';
import { listFeaturedPackages, listPublishedPackages } from '#lib/server/services/packages.js';
import { listPublishedServices } from '#lib/server/services/services.js';
import { listPublishedTestimonials } from '#lib/server/services/testimonials.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [featured, journeys, servicesWithCovers, testimonials, posts] = await Promise.all([
		listFeaturedPackages(5),
		listPublishedPackages({ take: 6 }),
		listPublishedServices(),
		listPublishedTestimonials(4),
		listLatestPosts(3)
	]);
	return {
		featured,
		journeys,
		servicesWithCovers,
		testimonials,
		posts,
		// Full-bleed hero: the header starts transparent over it.
		overHero: true
	};
};

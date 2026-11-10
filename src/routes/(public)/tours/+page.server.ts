import { listPublishedPackages } from '#lib/server/services/packages.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { services } = await parent();
	// Ignore unknown/unpublished service filters instead of showing an empty list.
	const requested = url.searchParams.get('service');
	const serviceSlug = services.some((s) => s.slug === requested) ? requested! : undefined;
	return {
		packages: await listPublishedPackages({ serviceSlug }),
		activeService: serviceSlug ?? ''
	};
};

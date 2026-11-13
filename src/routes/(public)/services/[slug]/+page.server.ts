import { listPublishedInstitutions } from '#lib/server/services/institutions.js';
import { listPublishedPackages } from '#lib/server/services/packages.js';
import { getPublicService, listPublishedServices } from '#lib/server/services/services.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const service = await getPublicService(params.slug);
	if (!service) error(404, 'This service could not be found.');
	const [packages, allServices, institutions] = await Promise.all([
		listPublishedPackages({ serviceSlug: service.slug, take: 9 }),
		listPublishedServices(),
		service.formType === 'STUDY_ABROAD' ? listPublishedInstitutions() : []
	]);
	return {
		service,
		packages,
		institutions,
		otherServices: allServices.filter((s) => s.id !== service.id).slice(0, 3),
		overHero: true
	};
};

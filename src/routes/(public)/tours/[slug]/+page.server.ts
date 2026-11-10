import { getPublicPackage, listRelatedPackages } from '#lib/server/services/packages.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const pkg = await getPublicPackage(params.slug);
	if (!pkg) error(404, 'This journey could not be found.');
	const related = await listRelatedPackages(
		pkg.id,
		pkg.services.map((s) => s.id),
		3
	);
	// bookingBar: a fixed mobile bar; the WhatsApp button moves up to make room.
	return { pkg, related, overHero: true, bookingBar: true };
};

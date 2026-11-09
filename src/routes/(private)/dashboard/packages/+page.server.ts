import { requireUser } from '#lib/server/guards.js';
import { listPackages } from '#lib/server/services/packages.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	requireUser();
	const serviceId = url.searchParams.get('service') || undefined;
	const q = url.searchParams.get('q')?.slice(0, 100) || undefined;
	const [packages, services] = await Promise.all([listPackages({ serviceId, q }), listServiceOptions()]);
	return { packages, services, serviceId: serviceId ?? '', q: q ?? '' };
};

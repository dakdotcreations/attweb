import { requireUser } from '#lib/server/guards.js';
import { listServices } from '#lib/server/services/services.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { services: await listServices() };
};

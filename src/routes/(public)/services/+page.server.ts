import { listPublishedServices } from '#lib/server/services/services.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { allServices: await listPublishedServices() };
};

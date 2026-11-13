import { requireUser } from '#lib/server/guards.js';
import { listInstitutions } from '#lib/server/services/institutions.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { institutions: await listInstitutions() };
};

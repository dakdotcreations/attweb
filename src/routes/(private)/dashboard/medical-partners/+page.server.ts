import { requireUser } from '#lib/server/guards.js';
import { listMedicalPartners } from '#lib/server/services/medical-partners.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { partners: await listMedicalPartners() };
};

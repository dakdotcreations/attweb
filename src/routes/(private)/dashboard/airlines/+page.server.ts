import { requireUser } from '#lib/server/guards.js';
import { listAirlines } from '#lib/server/services/airlines.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { airlines: await listAirlines() };
};

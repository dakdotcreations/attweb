import { listPublishedAirlineNames } from '#lib/server/services/airlines.js';
import { listPublishedTeam } from '#lib/server/services/team.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [team, airlines] = await Promise.all([listPublishedTeam(), listPublishedAirlineNames()]);
	return { team, airlines };
};

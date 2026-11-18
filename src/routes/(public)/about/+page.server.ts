import { listPartnerLogos } from '#lib/server/services/partner-logos.js';
import { listPublishedTeam } from '#lib/server/services/team.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [team, partnerLogos] = await Promise.all([listPublishedTeam(), listPartnerLogos()]);
	return { team, partnerLogos };
};

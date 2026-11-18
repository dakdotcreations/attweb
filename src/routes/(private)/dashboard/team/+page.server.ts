import { requireUser } from '#lib/server/guards.js';
import { listTeamMembers } from '#lib/server/services/team.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { members: await listTeamMembers() };
};

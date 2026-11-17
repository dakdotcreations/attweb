import { teamMemberSchema } from '#lib/schemas/team.js';
import { formFailure, isForeignKeyViolation, isNotFound, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { deleteTeamMember, getTeamMember, saveTeamMember } from '#lib/server/services/team.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const member = params.id === 'new' ? null : await getTeamMember(params.id);
	if (params.id !== 'new' && !member) error(404, 'Team member not found');
	return { member };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, teamMemberSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveTeamMember(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isForeignKeyViolation(err)) return formFailure({}, 'The selected photo no longer exists. Choose another.');
			if (isNotFound(err)) error(404, 'Team member not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/team/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteTeamMember(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/team');
	}
};

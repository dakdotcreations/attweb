import { institutionSchema } from '#lib/schemas/institutions.js';
import { formFailure, isForeignKeyViolation, isNotFound, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import {
	deleteInstitution,
	getInstitution,
	listInstitutionCountries,
	saveInstitution
} from '#lib/server/services/institutions.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	requireUser();
	const [institution, countries] = await Promise.all([
		params.id === 'new' ? null : getInstitution(params.id),
		listInstitutionCountries()
	]);
	if (params.id !== 'new' && !institution) error(404, 'Institution not found');
	// Only admins can open Inquiries, so only they get the "view requests" link.
	return { institution, countries, canViewInquiries: locals.user?.role === 'ADMIN' };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, institutionSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveInstitution(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isForeignKeyViolation(err)) return formFailure({}, 'The selected logo no longer exists. Choose another.');
			if (isNotFound(err)) error(404, 'Institution not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/institutions/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteInstitution(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/institutions');
	}
};

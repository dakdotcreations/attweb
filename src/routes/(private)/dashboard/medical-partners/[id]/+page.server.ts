import { medicalPartnerSchema } from '#lib/schemas/medical-partners.js';
import { formFailure, isForeignKeyViolation, isNotFound, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import {
	deleteMedicalPartner,
	getMedicalPartner,
	listMedicalPartnerCountries,
	saveMedicalPartner
} from '#lib/server/services/medical-partners.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const [partner, countries] = await Promise.all([
		params.id === 'new' ? null : getMedicalPartner(params.id),
		listMedicalPartnerCountries()
	]);
	if (params.id !== 'new' && !partner) error(404, 'Medical partner not found');
	return { partner, countries };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, medicalPartnerSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveMedicalPartner(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isForeignKeyViolation(err)) return formFailure({}, 'The selected logo no longer exists. Choose another.');
			if (isNotFound(err)) error(404, 'Medical partner not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/medical-partners/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteMedicalPartner(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/medical-partners');
	}
};

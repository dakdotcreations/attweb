import { airlineSchema } from '#lib/schemas/airlines.js';
import { formFailure, isForeignKeyViolation, isNotFound, isUniqueViolation, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { deleteAirline, getAirline, saveAirline } from '#lib/server/services/airlines.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const airline = params.id === 'new' ? null : await getAirline(params.id);
	if (params.id !== 'new' && !airline) error(404, 'Airline not found');
	return { airline };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, airlineSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveAirline(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isUniqueViolation(err, 'name')) return formFailure({ name: 'This airline is already in the list' });
			if (isForeignKeyViolation(err)) return formFailure({}, 'The selected logo no longer exists. Choose another.');
			if (isNotFound(err)) error(404, 'Airline not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/airlines/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteAirline(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/airlines');
	}
};

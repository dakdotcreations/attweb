import { serviceSchema } from '#lib/schemas/services.js';
import { formFailure, isNotFound, isUniqueViolation, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { countPublishedInstitutions } from '#lib/server/services/institutions.js';
import { deleteService, getService, saveService } from '#lib/server/services/services.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const [service, publishedInstitutions] = await Promise.all([
		params.id === 'new' ? null : getService(params.id),
		countPublishedInstitutions()
	]);
	if (params.id !== 'new' && !service) error(404, 'Service not found');
	return { service, publishedInstitutions };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, serviceSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveService(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isUniqueViolation(err, 'slug')) {
				return formFailure({ slug: 'Another service already uses this slug.' });
			}
			if (isNotFound(err)) error(404, 'Service not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/services/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteService(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/services');
	}
};

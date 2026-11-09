import { packageSchema } from '#lib/schemas/packages.js';
import {
	formFailure,
	isForeignKeyViolation,
	isNotFound,
	isUniqueViolation,
	parseJsonPayload
} from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { deletePackage, getPackage, savePackage } from '#lib/server/services/packages.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const [pkg, services] = await Promise.all([
		params.id === 'new' ? null : getPackage(params.id),
		listServiceOptions()
	]);
	if (params.id !== 'new' && !pkg) error(404, 'Package not found');
	return { pkg, services };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, packageSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await savePackage(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isUniqueViolation(err, 'slug')) {
				return formFailure({ slug: 'Another package already uses this slug.' });
			}
			if (isForeignKeyViolation(err)) {
				return formFailure({}, 'An image or service you selected no longer exists. Reload the page and try again.');
			}
			if (isNotFound(err)) error(404, 'Package not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/packages/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deletePackage(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/packages');
	}
};

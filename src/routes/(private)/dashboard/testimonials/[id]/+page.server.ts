import { testimonialSchema } from '#lib/schemas/testimonials.js';
import { formFailure, isForeignKeyViolation, isNotFound, parseJsonPayload } from '#lib/server/forms.js';
import { requireUser } from '#lib/server/guards.js';
import { listPackageOptions } from '#lib/server/services/packages.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import { deleteTestimonial, getTestimonial, saveTestimonial } from '#lib/server/services/testimonials.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireUser();
	const [testimonial, services, packages] = await Promise.all([
		params.id === 'new' ? null : getTestimonial(params.id),
		listServiceOptions(),
		listPackageOptions()
	]);
	if (params.id !== 'new' && !testimonial) error(404, 'Testimonial not found');
	return { testimonial, services, packages };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		requireUser();
		const parsed = await parseJsonPayload(request, testimonialSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = await saveTestimonial(isNew ? null : params.id, parsed.data));
		} catch (err) {
			if (isForeignKeyViolation(err)) {
				return formFailure({}, 'A selected photo, service or package no longer exists. Reload and try again.');
			}
			if (isNotFound(err)) error(404, 'Testimonial not found');
			throw err;
		}
		if (isNew) redirect(303, `/dashboard/testimonials/${id}`);
		return { saved: true };
	},

	delete: async ({ params }) => {
		requireUser();
		try {
			await deleteTestimonial(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/testimonials');
	}
};

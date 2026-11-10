import { db } from '#lib/server/db.js';
import { submitPublicInquiry } from '#lib/server/services/public-inquiry.js';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Optional preselection: /contact?package=<slug> or /contact?service=<slug>
	const packageSlug = url.searchParams.get('package');
	const serviceSlug = url.searchParams.get('service');
	const [pkg, service] = await Promise.all([
		packageSlug
			? db.tourPackage.findFirst({ where: { slug: packageSlug, status: 'PUBLISHED' }, select: { id: true, title: true } })
			: null,
		serviceSlug
			? db.service.findFirst({ where: { slug: serviceSlug, status: 'PUBLISHED' }, select: { id: true } })
			: null
	]);
	return { preselectPackage: pkg, preselectServiceId: service?.id ?? null };
};

export const actions: Actions = {
	// Shared by every inquiry form on the site (they post to /contact).
	default: async ({ request, locals }) => {
		const result = await submitPublicInquiry(await request.formData(), { currency: locals.currency });
		if (!result.ok) {
			return fail(result.status, { errors: result.errors, message: result.message, values: result.values });
		}
		return { success: true, number: result.number };
	}
};

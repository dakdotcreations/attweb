import { db } from '#lib/server/db.js';
import { listPublishedInstitutions } from '#lib/server/services/institutions.js';
import { submitPublicInquiry } from '#lib/server/services/public-inquiry.js';
import { fail, redirect } from '@sveltejs/kit';
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
			? db.service.findFirst({ where: { slug: serviceSlug, status: 'PUBLISHED' }, select: { id: true, slug: true, formType: true } })
			: null
	]);
	// Flight and study abroad requests have their own form on the service page.
	if (service && service.formType !== 'GENERAL') redirect(303, `/services/${service.slug}#inquire`);
	return { preselectPackage: pkg, preselectServiceId: service?.id ?? null };
};

export const actions: Actions = {
	// Shared by every inquiry form on the site (they post to /contact).
	default: async ({ request, locals }) => {
		const result = await submitPublicInquiry(await request.formData(), { currency: locals.currency });
		if (!result.ok) {
			// Without JS the visitor lands here, so send what the matching form needs to re-render.
			const institutions = result.kind === 'STUDY_ABROAD' ? await listPublishedInstitutions() : [];
			return fail(result.status, {
				errors: result.errors,
				message: result.message,
				kind: result.kind,
				values: result.values,
				institutions
			});
		}
		return { success: true, number: result.number };
	}
};

import { inquiryDetailsSchema, inquiryNoteSchema, inquiryStatusUpdateSchema } from '#lib/schemas/inquiries.js';
import {
	formFailure,
	isForeignKeyViolation,
	isNotFound,
	parseJsonPayload,
	zodFieldErrors
} from '#lib/server/forms.js';
import { requireAdmin } from '#lib/server/guards.js';
import {
	addInquiryNote,
	changeInquiryStatus,
	createInquiry,
	deleteInquiry,
	getInquiry,
	updateInquiryDetails
} from '#lib/server/services/inquiries.js';
import { listPackageOptions } from '#lib/server/services/packages.js';
import { listServiceOptions } from '#lib/server/services/services.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	requireAdmin();
	const [inquiry, services, packages] = await Promise.all([
		params.id === 'new' ? null : getInquiry(params.id),
		listServiceOptions(),
		listPackageOptions()
	]);
	if (params.id !== 'new' && !inquiry) error(404, 'Inquiry not found');
	return { inquiry, services, packages };
};

function notFoundOrThrow(err: unknown): never {
	if (isNotFound(err)) error(404, 'Inquiry not found');
	throw err;
}

export const actions: Actions = {
	/** Create (id = new) or edit the inquiry details. */
	save: async ({ request, params }) => {
		const user = requireAdmin();
		const parsed = await parseJsonPayload(request, inquiryDetailsSchema);
		if (!parsed.ok) return parsed.failure;

		const isNew = params.id === 'new';
		let id: string;
		try {
			({ id } = isNew
				? await createInquiry(parsed.data, user.id)
				: await updateInquiryDetails(params.id, parsed.data));
		} catch (err) {
			if (isForeignKeyViolation(err)) {
				return formFailure({}, 'The selected package or service no longer exists. Reload and try again.');
			}
			notFoundOrThrow(err);
		}
		if (isNew) redirect(303, `/dashboard/inquiries/${id}`);
		return { saved: true };
	},

	status: async ({ request, params }) => {
		const user = requireAdmin();
		const form = await request.formData();
		const parsed = inquiryStatusUpdateSchema.safeParse({
			status: form.get('status'),
			note: form.get('note') ?? ''
		});
		if (!parsed.success) return formFailure(zodFieldErrors(parsed.error));
		try {
			await changeInquiryStatus(params.id, parsed.data.status, user.id, parsed.data.note);
		} catch (err) {
			notFoundOrThrow(err);
		}
		return { statusUpdated: true };
	},

	note: async ({ request, params }) => {
		const user = requireAdmin();
		const parsed = inquiryNoteSchema.safeParse({ body: (await request.formData()).get('body') ?? '' });
		if (!parsed.success) return formFailure(zodFieldErrors(parsed.error));
		try {
			await addInquiryNote(params.id, parsed.data.body, user.id);
		} catch (err) {
			if (isForeignKeyViolation(err)) error(404, 'Inquiry not found');
			notFoundOrThrow(err);
		}
		return { noteAdded: true };
	},

	delete: async ({ params }) => {
		requireAdmin();
		try {
			await deleteInquiry(params.id);
		} catch (err) {
			if (!isNotFound(err)) throw err;
		}
		redirect(303, '/dashboard/inquiries');
	}
};

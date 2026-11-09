import { emailSchema, safeRedirectPath } from '#lib/schemas/auth.js';
import { auth } from '#lib/server/auth.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	return { redirectTo: safeRedirectPath(url.searchParams.get('redirectTo')) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const rawEmail = String(form.get('email') ?? '');
		const redirectTo = safeRedirectPath(String(form.get('redirectTo') ?? ''));

		const parsed = emailSchema.safeParse(rawEmail);
		if (!parsed.success) {
			return fail(400, { email: rawEmail, error: parsed.error.issues[0].message });
		}
		const email = parsed.data;

		try {
			// Sends only if the user exists; unknown emails get the same response.
			await auth.api.sendVerificationOTP({ body: { email, type: 'sign-in' } });
		} catch (err) {
			console.error('Failed to send login OTP', err);
			return fail(500, { email, error: 'We could not send the code. Please try again.' });
		}

		const params = new URLSearchParams({ email, redirectTo });
		redirect(303, `/auth/verify?${params}`);
	}
};

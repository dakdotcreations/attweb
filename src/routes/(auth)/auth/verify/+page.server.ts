import { emailSchema, otpSchema, safeRedirectPath } from '#lib/schemas/auth.js';
import { auth } from '#lib/server/auth.js';
import { fail, redirect } from '@sveltejs/kit';
import { isAPIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const email = emailSchema.safeParse(url.searchParams.get('email') ?? '');
	if (!email.success) redirect(303, '/auth/login');
	return {
		email: email.data,
		redirectTo: safeRedirectPath(url.searchParams.get('redirectTo'))
	};
};

export const actions: Actions = {
	verify: async ({ request }) => {
		const form = await request.formData();
		const email = emailSchema.safeParse(String(form.get('email') ?? ''));
		const otp = otpSchema.safeParse(String(form.get('otp') ?? ''));
		const redirectTo = safeRedirectPath(String(form.get('redirectTo') ?? ''));

		if (!email.success) redirect(303, '/auth/login');
		if (!otp.success) return fail(400, { error: otp.error.issues[0].message });

		try {
			// sveltekitCookies plugin writes the session cookie onto this response.
			await auth.api.signInEmailOTP({
				body: { email: email.data, otp: otp.data },
				headers: request.headers
			});
		} catch (err) {
			if (isAPIError(err)) {
				return fail(400, { error: 'That code is invalid or has expired.' });
			}
			console.error('OTP sign-in failed', err);
			return fail(500, { error: 'Something went wrong. Please try again.' });
		}

		redirect(303, redirectTo);
	},

	resend: async ({ request }) => {
		const form = await request.formData();
		const email = emailSchema.safeParse(String(form.get('email') ?? ''));
		if (!email.success) redirect(303, '/auth/login');

		try {
			await auth.api.sendVerificationOTP({ body: { email: email.data, type: 'sign-in' } });
		} catch (err) {
			console.error('Failed to resend login OTP', err);
			return fail(500, { error: 'We could not resend the code. Please try again.' });
		}
		return { resent: true };
	}
};

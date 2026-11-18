// POST currency=UGX|USD (+ redirectTo). Works as a plain form without JavaScript.
import { safeRedirectPath } from '#lib/schemas/auth.js';
import { setCurrencyCookie } from '#lib/server/currency.js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	setCurrencyCookie(cookies, form.get('currency'));
	redirect(303, safeRedirectPath(String(form.get('redirectTo') ?? ''), '/'));
};

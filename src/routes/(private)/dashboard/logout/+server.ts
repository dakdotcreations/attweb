import { auth } from '#lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// sveltekitCookies plugin clears the session cookie on this response.
	await auth.api.signOut({ headers: request.headers });
	redirect(303, '/auth/login');
};

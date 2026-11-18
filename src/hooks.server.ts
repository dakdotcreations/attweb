import { building } from '$app/env';
import { auth } from '#lib/server/auth.js';
import { resolveCurrency } from '#lib/server/currency.js';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = building ? null : await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;
	event.locals.currency = resolveCurrency(event.cookies, event.request.headers);

	const { pathname } = event.url;

	// Coarse guard for everything under /dashboard (covers loads, actions and endpoints).
	// Role checks happen per route with requireRole().
	if (!event.locals.user && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
		redirect(303, `/auth/login?redirectTo=${encodeURIComponent(pathname + event.url.search)}`);
	}

	// Signed-in users don't need the login pages.
	if (event.locals.user && pathname.startsWith('/auth/')) {
		redirect(303, '/dashboard');
	}

	// Serves better-auth's own endpoints under /api/auth/*, otherwise resolves normally.
	return svelteKitHandler({ event, resolve, auth, building });
};

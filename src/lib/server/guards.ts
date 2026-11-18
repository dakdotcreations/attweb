import { getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';
import type { UserRole } from './db';

/**
 * Returns the signed-in user or redirects to login.
 * Call in load functions AND form actions: SvelteKit does not run
 * layout loads before actions, so a layout guard alone does not protect them.
 */
export function requireUser() {
	const { locals, url } = getRequestEvent();
	if (!locals.user) {
		const redirectTo = url.pathname + url.search;
		redirect(303, `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}
	return locals.user;
}

/** Returns the signed-in user if they have one of `roles`, otherwise 403. */
export function requireRole(...roles: UserRole[]) {
	const user = requireUser();
	if (!roles.includes(user.role)) error(403, 'You do not have permission to access this page.');
	return user;
}

export const requireAdmin = () => requireRole('ADMIN');

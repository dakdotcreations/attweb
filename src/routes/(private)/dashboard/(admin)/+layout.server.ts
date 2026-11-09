// ADMIN-only section (users, settings). EDITORs get a 403.
// Form actions in these routes must also call requireAdmin(): layout loads don't run before actions.
import { requireAdmin } from '#lib/server/guards.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	requireAdmin();
};

import { requireUser } from '#lib/server/guards.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	const user = requireUser();
	return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

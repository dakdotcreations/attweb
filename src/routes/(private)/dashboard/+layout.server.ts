import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants.js';
import { requireUser } from '#lib/server/guards.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
	const user = requireUser();
	return {
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
		// Render the sidebar in its remembered state on the server (no flash on load).
		sidebarOpen: cookies.get(SIDEBAR_COOKIE_NAME) !== 'false'
	};
};

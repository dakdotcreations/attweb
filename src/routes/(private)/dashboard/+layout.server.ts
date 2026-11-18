import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants.js';
import { requireUser } from '#lib/server/guards.js';
import { countNewInquiries } from '#lib/server/services/inquiries.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = requireUser();
	return {
		user: { id: user.id, name: user.name, email: user.email, role: user.role },
		// Render the sidebar in its remembered state on the server (no flash on load).
		sidebarOpen: cookies.get(SIDEBAR_COOKIE_NAME) !== 'false',
		// Sidebar badges by nav href. Refreshed whenever a form action re-runs loads.
		navBadges: (user.role === 'ADMIN'
			? { '/dashboard/inquiries': await countNewInquiries() }
			: {}) as Record<string, number>
	};
};

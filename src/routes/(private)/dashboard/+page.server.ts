import { requireUser } from '#lib/server/guards.js';
import { recentNewInquiries } from '#lib/server/services/inquiries.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const user = requireUser();
	// Inquiries are ADMIN-only.
	return { newInquiries: user.role === 'ADMIN' ? await recentNewInquiries(5) : null };
};

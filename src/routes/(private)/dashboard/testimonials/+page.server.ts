import { requireUser } from '#lib/server/guards.js';
import { listTestimonials } from '#lib/server/services/testimonials.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	requireUser();
	return { testimonials: await listTestimonials() };
};

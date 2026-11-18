import { listPublishedServices } from '#lib/server/services/services.js';
import { getSettings } from '#lib/server/services/settings.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const [settings, services] = await Promise.all([getSettings(), listPublishedServices()]);
	return {
		currency: locals.currency,
		services: services.map(({ id, name, slug }) => ({ id, name, slug })),
		// Only public-facing settings go to the browser.
		site: {
			companyName: settings.companyName,
			tagline: settings.tagline,
			email: settings.email,
			phone: settings.phone,
			whatsappNumber: settings.whatsappNumber,
			address: settings.address,
			officeHours: settings.officeHours,
			socials: {
				facebook: settings.facebookUrl,
				instagram: settings.instagramUrl,
				tiktok: settings.tiktokUrl,
				youtube: settings.youtubeUrl,
				linkedin: settings.linkedinUrl,
				tripadvisor: settings.tripadvisorUrl
			},
			seoTitle: settings.seoTitle,
			seoDescription: settings.seoDescription,
			ogImageUrl: settings.ogImage?.url ?? null
		}
	};
};

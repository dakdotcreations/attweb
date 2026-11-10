// Shared constants for the public website.

export const BRAND = {
	name: 'Altura Tours & Travel',
	legalName: 'Altura Tours & Travel Limited',
	tagline: 'Your journey, our passion'
} as const;

/** Shown as written per the business (from their flyers). */
export const TRUST_BADGES = ['Multiple award-winning tour operator', 'Member of Uganda Tourism Association'] as const;

export const MAIN_NAV = [
	{ label: 'Tours', href: '/tours' },
	{ label: 'Services', href: '/services', children: 'services' as const },
	{ label: 'Gallery', href: '/gallery' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' }
];

/**
 * Logo files (added by the business into static/brand/). Until they exist the
 * Logo component falls back to a Cinzel wordmark.
 */
export const LOGO = {
	/** Stacked crest; light backgrounds only. */
	full: '/brand/logo-full.webp',
	/** Crane only; used with the text wordmark in header/footer and as the favicon. */
	mark: '/brand/logo-mark.webp'
} as const;

export const DEFAULT_WHATSAPP_MESSAGE = "Hi Altura, I'd like to plan a trip.";

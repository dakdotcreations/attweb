// About page copy, from Altura's printed brochure (lightly copy-edited). Edit here to update.

export const VISION =
	'To become a leading and trusted tours and travel company in Uganda and beyond, recognised for delivering exceptional travel experiences, promoting tourism, and connecting people to beautiful destinations around the world.';

export const MISSION =
	"To provide safe, reliable, affordable and high-quality tours and travel services that meet the needs of our clients. We are committed to excellent customer service, professional travel planning, and promoting Uganda's natural beauty, cultural heritage and tourist attractions.";

export const OBJECTIVES = [
	{
		icon: 'mountain',
		title: 'Promote tourism',
		text: "Promote local and international tourism by showcasing Uganda's beautiful landscapes, wildlife, cultural heritage and tourist attractions."
	},
	{
		icon: 'gem',
		title: 'Provide quality services',
		text: 'Offer reliable, comfortable and professional tours and travel services that exceed customer expectations.'
	},
	{
		icon: 'heart-handshake',
		title: 'Customer satisfaction',
		text: 'Build lasting relationships with clients through excellent customer care, honesty and personalised travel solutions.'
	},
	{
		icon: 'wallet',
		title: 'Affordable travel packages',
		text: 'Provide competitive and flexible travel packages that suit different customer needs and budgets.'
	},
	{
		icon: 'shield-check',
		title: 'Safety and comfort',
		text: 'Prioritise the safety, comfort and well-being of our clients throughout their journeys.'
	},
	{
		icon: 'handshake',
		title: 'Grow through partnerships',
		text: 'Grow our business by building partnerships with hotels, airlines, tour operators and other tourism stakeholders.'
	},
	{
		icon: 'users',
		title: 'Create employment',
		text: 'Contribute to community development by creating jobs and supporting local businesses in the tourism sector.'
	},
	{
		icon: 'leaf',
		title: 'Sustainable tourism',
		text: 'Encourage responsible tourism that protects the environment, preserves cultural heritage and benefits local communities.'
	},
	{
		icon: 'lightbulb',
		title: 'Embrace innovation',
		text: 'Use modern technology and effective marketing to improve service delivery and reach more customers.'
	}
] as const;

/** "Choose Altura Tours and Travel": the wider good each trip does. */
export const IMPACT = [
	'Promotes tourism and showcases beautiful destinations',
	'Creates employment and business opportunities',
	'Supports hotels, transport providers, tour guides and local communities',
	'Encourages cultural exchange and understanding',
	'Provides opportunities for relaxation, adventure and education',
	'Contributes to economic development',
	'Promotes conservation and appreciation of nature'
] as const;

/** Full service list as printed in the brochure. */
export const BROCHURE_SERVICES = [
	'Guided wildlife safaris',
	'Gorilla and chimpanzee trekking',
	'Custom luxury itineraries',
	'Flight reservations and ticketing',
	'Visa application and assistance',
	'Corporate and business travel',
	'Study abroad programmes',
	'Airport transfers and car rentals',
	'School tours',
	'Medical tourism',
	'Car bonding'
] as const;

/** Airlines shown on Altura's flyers (names only; logos are the airlines' trademarks). */
export const AIRLINES = [
	'Uganda Airlines',
	'Qatar Airways',
	'Emirates',
	'Kenya Airways',
	'Ethiopian Airlines',
	'Turkish Airlines',
	'flydubai',
	'EgyptAir',
	'RwandAir',
	'KLM',
	'Brussels Airlines',
	'South African Airways',
	'Etihad Airways',
	'Air Arabia',
	'Air Tanzania'
] as const;

/**
 * "Issued by": the real people who plan trips and answer WhatsApp, shown on the About page.
 * Add one entry per person (real names and photos only). Put photos in static/team/, e.g.
 * { name: 'Sarah', role: 'Safari planner', photo: '/team/sarah.jpg', whatsapp: '+256700000000' }.
 * The section stays hidden while this list is empty.
 */
export type TeamMember = { name: string; role: string; photo: string; whatsapp?: string };
export const TEAM: TeamMember[] = [];

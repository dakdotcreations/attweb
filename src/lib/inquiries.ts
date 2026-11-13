// Inquiry labels and helpers shared by dashboard and public pages.

export const INQUIRY_STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST', 'CLOSED'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_SOURCES = ['WEBSITE', 'WHATSAPP', 'EMAIL', 'PHONE', 'WALK_IN', 'OTHER'] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];

export const CONTACT_CHANNELS = ['WHATSAPP', 'EMAIL', 'PHONE'] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export const statusMeta: Record<InquiryStatus, { label: string; description: string; class: string }> = {
	NEW: { label: 'New', description: 'Not yet contacted', class: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
	CONTACTED: { label: 'Contacted', description: 'We replied and are talking', class: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
	QUOTED: { label: 'Quoted', description: 'A price was sent', class: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
	WON: { label: 'Won', description: 'Booked', class: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' },
	LOST: { label: 'Lost', description: 'Did not book', class: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' },
	CLOSED: { label: 'Closed', description: 'Spam, duplicate or no longer relevant', class: 'bg-muted text-muted-foreground' }
};

export const sourceLabels: Record<InquirySource, string> = {
	WEBSITE: 'Website',
	WHATSAPP: 'WhatsApp',
	EMAIL: 'Email',
	PHONE: 'Phone call',
	WALK_IN: 'Walk-in',
	OTHER: 'Other'
};

export const channelLabels: Record<ContactChannel, string> = {
	WHATSAPP: 'WhatsApp',
	EMAIL: 'Email',
	PHONE: 'Phone call'
};

/**
 * Digits for wa.me links. Local Ugandan numbers ("0700 123456") are assumed
 * to be +256; anything else must already include its country code.
 */
export function toWhatsAppDigits(phone: string | null | undefined) {
	if (!phone) return null;
	const trimmed = phone.trim();
	const digits = trimmed.replace(/\D/g, '');
	if (!digits) return null;
	if (trimmed.startsWith('+')) return digits;
	if (digits.startsWith('00')) return digits.slice(2);
	if (digits.startsWith('0') && digits.length === 10) return `256${digits.slice(1)}`;
	return digits;
}

export function whatsappLink(phone: string | null | undefined, text?: string) {
	const digits = toWhatsAppDigits(phone);
	if (!digits) return null;
	return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export const formatInquiryNumber = (n: number) => `#${n}`;

// ---------------------------------------------------------------------------
// Request forms (flight requests, study abroad). See lib/schemas/inquiry-details.ts.
// ---------------------------------------------------------------------------

export const INQUIRY_KINDS = ['GENERAL', 'FLIGHT', 'STUDY_ABROAD'] as const;
export type InquiryKind = (typeof INQUIRY_KINDS)[number];

/** Same values as InquiryKind: the service decides which form its page shows. */
export const SERVICE_FORM_TYPES = INQUIRY_KINDS;
export type ServiceFormType = InquiryKind;

export const kindLabels: Record<InquiryKind, string> = {
	GENERAL: 'General inquiry',
	FLIGHT: 'Flight request',
	STUDY_ABROAD: 'Study abroad request'
};

export const formTypeLabels: Record<ServiceFormType, string> = {
	GENERAL: 'General inquiry form',
	FLIGHT: 'Flight request form',
	STUDY_ABROAD: 'Study abroad form'
};

export const TRIP_TYPES = ['RETURN', 'ONE_WAY', 'MULTI_CITY'] as const;
export type TripType = (typeof TRIP_TYPES)[number];
export const tripTypeLabels: Record<TripType, string> = {
	RETURN: 'Return',
	ONE_WAY: 'One-way',
	MULTI_CITY: 'Multi-city'
};

export const CABIN_CLASSES = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'] as const;
export type CabinClass = (typeof CABIN_CLASSES)[number];
export const cabinLabels: Record<CabinClass, string> = {
	ECONOMY: 'Economy',
	PREMIUM_ECONOMY: 'Premium economy',
	BUSINESS: 'Business',
	FIRST: 'First'
};

/** Carriers the ticketing team books (from the Flights service page). */
export const AIRLINES = [
	'Uganda Airlines',
	'Kenya Airways',
	'Emirates',
	'Qatar Airways',
	'Etihad',
	'Ethiopian Airlines',
	'RwandAir',
	'Turkish Airlines',
	'EgyptAir',
	'KLM',
	'Brussels Airlines',
	'flydubai',
	'Air Arabia',
	'South African Airways',
	'Air Tanzania',
	'Malaysia Airlines'
] as const;
export const MAX_AIRLINES = 5;

/** Suggestions for the From/To fields; visitors can type any city. */
export const AIRPORT_SUGGESTIONS = [
	'Entebbe (EBB)',
	'Nairobi (NBO)',
	'Mombasa (MBA)',
	'Kigali (KGL)',
	'Dar es Salaam (DAR)',
	'Zanzibar (ZNZ)',
	'Kilimanjaro (JRO)',
	'Addis Ababa (ADD)',
	'Johannesburg (JNB)',
	'Cape Town (CPT)',
	'Cairo (CAI)',
	'Dubai (DXB)',
	'Abu Dhabi (AUH)',
	'Doha (DOH)',
	'Istanbul (IST)',
	'Mumbai (BOM)',
	'Delhi (DEL)',
	'Chennai (MAA)',
	'Bangkok (BKK)',
	'Phuket (HKT)',
	'Kuala Lumpur (KUL)',
	'Guangzhou (CAN)',
	'London Heathrow (LHR)',
	'Amsterdam (AMS)',
	'Brussels (BRU)',
	'Paris (CDG)',
	'Frankfurt (FRA)',
	'New York (JFK)',
	'Toronto (YYZ)',
	'Jeddah (JED)'
] as const;

export const MAX_FLIGHT_LEGS = 5;

export const STUDY_LEVELS = ['FOUNDATION', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD'] as const;
export type StudyLevel = (typeof STUDY_LEVELS)[number];
export const studyLevelLabels: Record<StudyLevel, string> = {
	FOUNDATION: 'Foundation',
	DIPLOMA: 'Diploma',
	BACHELOR: "Bachelor's",
	MASTER: "Master's",
	PHD: 'PhD'
};

export const MAX_INSTITUTIONS = 3;

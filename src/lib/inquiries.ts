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

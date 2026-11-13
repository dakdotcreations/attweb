import { CONTACT_CHANNELS, INQUIRY_SOURCES, INQUIRY_STATUSES } from '#lib/inquiries.js';
import { z } from 'zod';
import { nullableText, optionalText, requiredText } from './common.js';

export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);

/** "YYYY-MM-DD" from a date input; empty → null. Stored as a date-only value at UTC midnight. */
export const dateOnly = z
	.string()
	.trim()
	.transform((v) => v || null)
	.pipe(
		z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
			.transform((v) => new Date(`${v}T00:00:00Z`))
			.refine((d) => !Number.isNaN(d.getTime()), 'Enter a valid date')
			.nullable()
	);

const optionalEmail = z
	.string()
	.trim()
	.toLowerCase()
	.transform((v) => v || null)
	.pipe(z.email('Enter a valid email').nullable());

/** Fields common to website submissions and staff-logged inquiries. */
export const inquiryContactFields = {
	name: requiredText(120, 'Name'),
	email: optionalEmail,
	phone: nullableText(40, 'Phone'),
	country: nullableText(80, 'Country'),
	message: requiredText(5000, 'Message'),
	travelDate: dateOnly,
	groupSize: z.number('Enter a number').int('Use a whole number').min(1, 'At least 1').max(1000).nullable(),
	preferredContact: z.enum(CONTACT_CHANNELS).nullable()
};

const needsContact = <T extends { email: string | null; phone: string | null }>(v: T) =>
	!!(v.email || v.phone);
const needsContactMessage = { message: 'Enter an email or a phone number', path: ['email'] };

/** Staff create/edit form in the dashboard. */
export const inquiryDetailsSchema = z
	.object({
		...inquiryContactFields,
		// Optional here: flight/study requests often arrive without notes and must stay editable.
		message: optionalText(5000, 'Message'),
		interest: nullableText(200, 'Interest'),
		packageId: z.string().min(1).nullable(),
		serviceId: z.string().min(1).nullable(),
		currency: z.enum(['UGX', 'USD']).nullable(),
		source: z.enum(INQUIRY_SOURCES)
	})
	.refine(needsContact, needsContactMessage);

export const inquiryStatusUpdateSchema = z.object({
	status: inquiryStatusSchema,
	note: z.string().trim().max(5000, 'Note must be 5000 characters or fewer')
});

export const inquiryNoteSchema = z.object({
	body: requiredText(5000, 'Note')
});

export type InquiryDetailsInput = z.input<typeof inquiryDetailsSchema>;
export type InquiryDetailsData = z.output<typeof inquiryDetailsSchema>;

/** Empty string from a form field → null, otherwise a number (NaN fails validation). */
const formNumber = z.preprocess(
	(v) => (v === '' || v == null ? null : Number(v)),
	inquiryContactFields.groupSize
);

const publicInquiryFields = {
	...inquiryContactFields,
	groupSize: formNumber,
	preferredContact: z.preprocess((v) => v || null, inquiryContactFields.preferredContact),
	packageId: z.preprocess((v) => v || null, z.string().max(40).nullable()),
	serviceId: z.preprocess((v) => v || null, z.string().max(40).nullable()),
	sourceUrl: z.preprocess((v) => v || null, z.string().max(500).nullable())
};
const publicNeedsContact = { message: 'Enter your email or a WhatsApp/phone number', path: ['email'] };

/**
 * Public website inquiry form (regular form fields, works without JS).
 * `website` is a honeypot and `startedAt` a time trap; both are checked in the action.
 */
export const publicInquirySchema = z.object(publicInquiryFields).refine(needsContact, publicNeedsContact);

/**
 * Contact block of the flight and study abroad request forms: the structured answers carry
 * the request, so the message is optional extra notes.
 */
export const publicRequestContactSchema = z
	.object({ ...publicInquiryFields, message: optionalText(5000, 'Message') })
	.refine(needsContact, publicNeedsContact);

export type PublicInquiryData = z.output<typeof publicInquirySchema>;

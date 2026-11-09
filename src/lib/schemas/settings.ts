import { z } from 'zod';
import { mediaIdSchema, nullableText, requiredText, seoSchema } from './common.js';

const optionalEmail = (label: string) =>
	z
		.string()
		.trim()
		.toLowerCase()
		.transform((v) => v || null)
		.pipe(z.email(`${label} must be a valid email`).nullable());

const optionalUrl = (label: string) =>
	z
		.string()
		.trim()
		.transform((v) => v || null)
		.pipe(z.url({ protocol: /^https?$/, message: `${label} must be a full link starting with https://` }).nullable());

export const settingsSchema = z.object({
	companyName: requiredText(120, 'Company name'),
	tagline: nullableText(160, 'Tagline'),
	email: optionalEmail('Email'),
	inquiryEmail: optionalEmail('Inquiry email'),
	phone: nullableText(40, 'Phone'),
	whatsappNumber: z
		.string()
		.transform((v) => v.replace(/[\s()-]/g, '') || null)
		.pipe(
			z
				.string()
				.regex(/^\+[1-9]\d{7,14}$/, 'Use international format, e.g. +256 700 000000')
				.nullable()
		),
	address: nullableText(300, 'Address'),
	officeHours: nullableText(200, 'Office hours'),
	facebookUrl: optionalUrl('Facebook'),
	instagramUrl: optionalUrl('Instagram'),
	tiktokUrl: optionalUrl('TikTok'),
	youtubeUrl: optionalUrl('YouTube'),
	linkedinUrl: optionalUrl('LinkedIn'),
	tripadvisorUrl: optionalUrl('Tripadvisor'),
	ogImageId: mediaIdSchema,
	...seoSchema
});

export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsData = z.output<typeof settingsSchema>;

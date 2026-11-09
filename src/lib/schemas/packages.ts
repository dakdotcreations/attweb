import { slugSchema } from '#lib/slug.js';
import { z } from 'zod';
import {
	mediaIdSchema,
	nullableText,
	optionalText,
	publishStatusSchema,
	requiredText,
	richTextSchema,
	seoSchema,
	sortOrderSchema
} from './common.js';

const amount = (max: number) =>
	z.number('Enter a number').int('Use whole amounts').min(0, 'Must be 0 or more').max(max, 'Amount is too large').nullable();

export const packagePriceSchema = z
	.object({
		label: requiredText(100, 'Label'),
		amountUGX: amount(2_000_000_000),
		amountUSD: amount(1_000_000),
		isFromPrice: z.boolean()
	})
	.refine((p) => p.amountUGX != null || p.amountUSD != null, {
		message: 'Enter a UGX or USD amount (or both)',
		path: ['amountUGX']
	});

/** Short text bullets; blank rows are dropped. */
const bulletList = (label: string) =>
	z
		.array(z.string().trim().max(200, `${label} items must be 200 characters or fewer`))
		.max(50, `At most 50 ${label.toLowerCase()} items`)
		.transform((items) => items.filter(Boolean));

export const packageSchema = z.object({
	title: requiredText(150, 'Title'),
	slug: slugSchema,
	summary: optionalText(300, 'Summary'),
	description: richTextSchema,
	durationDays: z.number('Enter the number of days').int('Use a whole number').min(1, 'At least 1 day').max(365),
	durationNights: z.number().int('Use a whole number').min(0).max(365).nullable(),
	location: nullableText(120, 'Location'),
	coverImageId: mediaIdSchema,
	galleryIds: z.array(z.string().min(1)).max(60, 'At most 60 gallery images'),
	serviceIds: z.array(z.string().min(1)).max(20),
	prices: z
		.array(packagePriceSchema)
		.max(20, 'At most 20 price tiers')
		.refine((prices) => prices.filter((p) => p.isFromPrice).length <= 1, 'Only one price can be the "from" price'),
	highlights: bulletList('Highlight'),
	inclusions: bulletList('Inclusion'),
	exclusions: bulletList('Exclusion'),
	featured: z.boolean(),
	status: publishStatusSchema,
	sortOrder: sortOrderSchema,
	...seoSchema
});

export type PackageInput = z.input<typeof packageSchema>;
export type PackageData = z.output<typeof packageSchema>;
export type PackagePriceInput = z.input<typeof packagePriceSchema>;

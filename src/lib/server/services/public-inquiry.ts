// Website inquiry submission: spam checks → validation → save → notify team → confirm to customer.
import { BETTER_AUTH_URL } from '$app/env/private';
import type { Currency } from '#lib/format.js';
import { whatsappLink } from '#lib/inquiries.js';
import { publicInquirySchema } from '#lib/schemas/inquiries.js';
import { db } from '../db.js';
import { sendInquiryConfirmation, sendInquiryNotification } from '../email.js';
import { zodFieldErrors, type FieldErrors } from '../forms.js';
import { createInquiry } from './inquiries.js';
import { getSettings } from './settings.js';

/** Bots submit instantly; people take longer than this to fill the form. */
const MIN_FILL_MS = 3000;
/** Max inquiries per email/phone in the window below (stops accidental and bot floods). */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export type InquirySubmitResult =
	| { ok: true; number: number | null }
	| { ok: false; status: number; errors: FieldErrors; message: string; values: Record<string, string> };

/** Form values echoed back on errors so nothing the visitor typed is lost (no-JS too). */
function echo(form: FormData) {
	const keys = ['name', 'email', 'phone', 'country', 'travelDate', 'groupSize', 'preferredContact', 'message', 'packageId', 'serviceId'];
	return Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? '').slice(0, 5000)]));
}

export async function submitPublicInquiry(form: FormData, ctx: { currency: Currency }): Promise<InquirySubmitResult> {
	// Spam traps: a hidden "website" field humans never fill, and a minimum time on the form.
	// Bots get a fake success so they don't learn to adapt.
	const startedAt = Number(form.get('startedAt'));
	if (String(form.get('website') ?? '') !== '' || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
		return { ok: true, number: null };
	}

	const parsed = publicInquirySchema.safeParse({
		name: form.get('name') ?? '',
		email: form.get('email') ?? '',
		phone: form.get('phone') ?? '',
		country: form.get('country') ?? '',
		message: form.get('message') ?? '',
		travelDate: form.get('travelDate') ?? '',
		groupSize: form.get('groupSize'),
		preferredContact: form.get('preferredContact'),
		packageId: form.get('packageId'),
		serviceId: form.get('serviceId'),
		sourceUrl: form.get('sourceUrl')
	});
	if (!parsed.success) {
		return {
			ok: false,
			status: 400,
			errors: zodFieldErrors(parsed.error),
			message: 'Please check the highlighted fields.',
			values: echo(form)
		};
	}
	const data = parsed.data;

	const recent = await db.inquiry.count({
		where: {
			createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
			OR: [...(data.email ? [{ email: data.email }] : []), ...(data.phone ? [{ phone: data.phone }] : [])]
		}
	});
	if (recent >= RATE_LIMIT) {
		return {
			ok: false,
			status: 429,
			errors: {},
			message: "We've already received your recent messages. Our team will be in touch shortly, or reach us on WhatsApp.",
			values: echo(form)
		};
	}

	// Only link to things visitors can actually see.
	const [pkg, service] = await Promise.all([
		data.packageId
			? db.tourPackage.findFirst({ where: { id: data.packageId, status: 'PUBLISHED' }, select: { id: true, title: true } })
			: null,
		data.serviceId
			? db.service.findFirst({ where: { id: data.serviceId, status: 'PUBLISHED' }, select: { id: true, name: true } })
			: null
	]);

	const { sourceUrl, ...fields } = data;
	const inquiry = await createInquiry(
		{
			...fields,
			packageId: pkg?.id ?? null,
			serviceId: service?.id ?? null,
			interest: pkg?.title ?? service?.name ?? null,
			currency: ctx.currency,
			source: 'WEBSITE',
			sourceUrl
		},
		null
	);

	// Emails must not fail the submission: the inquiry is already saved and visible in the dashboard.
	const settings = await getSettings();
	const notifyTo = settings.inquiryEmail ?? settings.email;
	const interest = pkg?.title ?? service?.name ?? null;
	await Promise.allSettled([
		notifyTo
			? sendInquiryNotification(
					notifyTo,
					{ ...fields, number: inquiry.number, interest },
					`${BETTER_AUTH_URL}/dashboard/inquiries/${inquiry.id}`
				)
			: Promise.resolve(),
		data.email
			? sendInquiryConfirmation(data.email, {
					name: data.name,
					number: inquiry.number,
					interest,
					companyName: settings.companyName,
					whatsappUrl: whatsappLink(settings.whatsappNumber, `Hi Altura, about my inquiry #${inquiry.number}`)
				})
			: Promise.resolve()
	]).then((results) => {
		for (const r of results) if (r.status === 'rejected') console.error('Inquiry email failed', r.reason);
	});

	return { ok: true, number: inquiry.number };
}

// Website inquiry submission: spam checks → validation → save → notify team → confirm to customer.
// One entry point for every public form; `kind` selects the general, flight or study abroad fields.
import { BETTER_AUTH_URL } from '$app/env/private';
import type { Currency } from '#lib/format.js';
import { INQUIRY_KINDS, kindLabels, studyLevelLabels, whatsappLink, type InquiryKind } from '#lib/inquiries.js';
import {
	flightDetailsSchema,
	flightSummary,
	formatDetails,
	readFlightForm,
	readStudyForm,
	studyDetailsSchema,
	type DetailRow,
	type FlightDetails,
	type StudyDetails
} from '#lib/schemas/inquiry-details.js';
import { publicInquirySchema, publicRequestContactSchema } from '#lib/schemas/inquiries.js';
import { db } from '../db.js';
import { sendInquiryConfirmation, sendInquiryNotification } from '../email.js';
import { zodFieldErrors, type FieldErrors } from '../forms.js';
import { createInquiry, type InquiryInstitutionChoice } from './inquiries.js';
import { getSettings } from './settings.js';

/** Bots submit instantly; people take longer than this to fill the form. */
const MIN_FILL_MS = 3000;
/** Max inquiries per email/phone in the window below (stops accidental and bot floods). */
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export type InquirySubmitResult =
	| { ok: true; number: number | null }
	| {
			ok: false;
			status: number;
			errors: FieldErrors;
			message: string;
			kind: InquiryKind;
			values: Record<string, string>;
	  };

const SKIP_ECHO = new Set(['website', 'startedAt']);

/**
 * Form values echoed back on errors so nothing the visitor typed is lost (no-JS too).
 * Repeated fields (airline and institution checkboxes) are joined with "|".
 */
function echo(form: FormData) {
	const values: Record<string, string> = {};
	for (const key of new Set(form.keys())) {
		if (SKIP_ECHO.has(key)) continue;
		values[key] = form
			.getAll(key)
			.map((v) => String(v).slice(0, 5000))
			.join('|');
	}
	return values;
}

function readKind(form: FormData): InquiryKind {
	const kind = String(form.get('kind') ?? '');
	return (INQUIRY_KINDS as readonly string[]).includes(kind) ? (kind as InquiryKind) : 'GENERAL';
}

type KindFields = {
	details?: FlightDetails | StudyDetails;
	institutions?: InquiryInstitutionChoice[];
	travelDate?: Date;
	groupSize?: number;
	interest: string | null;
	/** Phrase for the customer confirmation ("Thank you for contacting us about …") */
	confirmAbout?: string;
	/** For the team notification email */
	detailRows: DetailRow[];
};

export async function submitPublicInquiry(form: FormData, ctx: { currency: Currency }): Promise<InquirySubmitResult> {
	// Spam traps: a hidden "website" field humans never fill, and a minimum time on the form.
	// Bots get a fake success so they don't learn to adapt.
	const startedAt = Number(form.get('startedAt'));
	if (String(form.get('website') ?? '') !== '' || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
		return { ok: true, number: null };
	}

	const kind = readKind(form);
	const invalid = (status: number, errors: FieldErrors, message: string): InquirySubmitResult => ({
		ok: false,
		status,
		errors,
		message,
		kind,
		values: echo(form)
	});

	const contactSchema = kind === 'GENERAL' ? publicInquirySchema : publicRequestContactSchema;
	const parsed = contactSchema.safeParse({
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
	const flight = kind === 'FLIGHT' ? flightDetailsSchema.safeParse(readFlightForm(form)) : null;
	const study = kind === 'STUDY_ABROAD' ? studyDetailsSchema.safeParse(readStudyForm(form)) : null;

	const errors: FieldErrors = {
		...(flight && !flight.success ? zodFieldErrors(flight.error) : {}),
		...(study && !study.success ? zodFieldErrors(study.error) : {}),
		...(!parsed.success ? zodFieldErrors(parsed.error) : {})
	};
	if (!parsed.success || (flight && !flight.success) || (study && !study.success)) {
		return invalid(400, errors, 'Please check the highlighted fields.');
	}
	const data = parsed.data;

	const recent = await db.inquiry.count({
		where: {
			createdAt: { gte: new Date(Date.now() - RATE_WINDOW_MS) },
			OR: [...(data.email ? [{ email: data.email }] : []), ...(data.phone ? [{ phone: data.phone }] : [])]
		}
	});
	if (recent >= RATE_LIMIT) {
		return invalid(
			429,
			{},
			"We've already received your recent messages. Our team will be in touch shortly, or reach us on WhatsApp."
		);
	}

	// Only link to things visitors can actually see.
	const [pkg, service, publishedInstitutions] = await Promise.all([
		data.packageId
			? db.tourPackage.findFirst({ where: { id: data.packageId, status: 'PUBLISHED' }, select: { id: true, title: true } })
			: null,
		data.serviceId
			? db.service.findFirst({ where: { id: data.serviceId, status: 'PUBLISHED' }, select: { id: true, name: true } })
			: null,
		study?.success
			? db.partnerInstitution.findMany({
					where: { id: { in: study.data.institutionIds }, status: 'PUBLISHED' },
					select: { id: true, name: true, country: true }
				})
			: []
	]);

	// Kind-specific fields, plus the shared columns the inquiry list shows and searches.
	let extra: KindFields = { interest: pkg?.title ?? service?.name ?? null, detailRows: [] };

	if (flight?.success) {
		const d = flight.data;
		extra = {
			details: d,
			travelDate: new Date(`${d.legs[0].date}T00:00:00Z`),
			groupSize: d.adults + d.children + d.infants,
			interest: `Flight: ${flightSummary(d)}`.slice(0, 200),
			confirmAbout: `your flight request, ${flightSummary(d)}`,
			detailRows: formatDetails('FLIGHT', d)
		};
	} else if (study?.success) {
		// Keep the visitor's ranking; drop anything unpublished or deleted meanwhile.
		const byId = new Map(publishedInstitutions.map((i) => [i.id, i]));
		const chosen = study.data.institutionIds.flatMap((id) => {
			const i = byId.get(id);
			return i ? [{ institutionId: i.id, name: i.name, country: i.country }] : [];
		});
		if (!chosen.length) {
			return invalid(
				400,
				{ institutionIds: 'Those institutions are no longer available. Please choose again.' },
				'Please check the highlighted fields.'
			);
		}
		const { institutionIds: _ids, ...details } = study.data;
		extra = {
			details,
			institutions: chosen,
			interest: `Study: ${studyLevelLabels[details.level]} – ${details.course}`.slice(0, 200),
			confirmAbout: `studying ${details.course}`,
			detailRows: [
				...formatDetails('STUDY_ABROAD', details),
				...chosen.map((c, i) => ({ label: `Choice ${i + 1}`, value: `${c.name} (${c.country})` }))
			]
		};
	}

	const { sourceUrl, ...fields } = data;
	const travelDate = extra.travelDate ?? fields.travelDate;
	const groupSize = extra.groupSize ?? fields.groupSize;
	const interest = extra.interest;
	const inquiry = await createInquiry(
		{
			...fields,
			travelDate,
			groupSize,
			packageId: pkg?.id ?? null,
			serviceId: service?.id ?? null,
			interest,
			currency: ctx.currency,
			source: 'WEBSITE',
			sourceUrl,
			kind,
			details: extra.details,
			institutions: extra.institutions
		},
		null
	);

	// Emails must not fail the submission: the inquiry is already saved and visible in the dashboard.
	const settings = await getSettings();
	const notifyTo = settings.inquiryEmail ?? settings.email;
	await Promise.allSettled([
		notifyTo
			? sendInquiryNotification(
					notifyTo,
					{
						...fields,
						travelDate,
						groupSize,
						number: inquiry.number,
						interest,
						kindLabel: kind === 'GENERAL' ? null : kindLabels[kind],
						details: extra.detailRows
					},
					`${BETTER_AUTH_URL}/dashboard/inquiries/${inquiry.id}`
				)
			: Promise.resolve(),
		data.email
			? sendInquiryConfirmation(data.email, {
					name: data.name,
					number: inquiry.number,
					interest: extra.confirmAbout ?? interest,
					companyName: settings.companyName,
					whatsappUrl: whatsappLink(settings.whatsappNumber, `Hi Altura, about my inquiry #${inquiry.number}`)
				})
			: Promise.resolve()
	]).then((results) => {
		for (const r of results) if (r.status === 'rejected') console.error('Inquiry email failed', r.reason);
	});

	return { ok: true, number: inquiry.number };
}

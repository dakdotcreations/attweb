// Kind-specific answers from the public request forms. Stored in Inquiry.details (JSON);
// study abroad institution choices live in the InquiryInstitution table instead.
import { formatDateOnly } from '#lib/format.js';
import {
	CABIN_CLASSES,
	MAX_AIRLINES,
	MAX_FLIGHT_LEGS,
	MAX_INSTITUTIONS,
	STAY_TYPES,
	STUDY_LEVELS,
	TRIP_TYPES,
	cabinLabels,
	stayTypeLabels,
	studyLevelLabels,
	tripTypeLabels,
	type InquiryKind
} from '#lib/inquiries.js';
import { z } from 'zod';
import { nullableText, requiredText } from './common.js';

/** "YYYY-MM-DD", kept as a string so it round-trips through JSON unchanged. */
const dateString = (label: string) =>
	z
		.string()
		.trim()
		.min(1, `${label} is required`)
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date')
		.refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()), 'Enter a valid date');

/** Yesterday in UTC: lenient enough for visitors in time zones ahead of the server. */
const earliestDate = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const flightLegSchema = z.object({
	from: requiredText(80, 'Departure city'),
	to: requiredText(80, 'Destination'),
	date: dateString('Date')
});

const accommodationSchema = z.object({
	type: z.enum(STAY_TYPES, 'Choose a hotel or an Airbnb'),
	/** Only for hotels; null = no preference, staff suggest options. */
	hotelName: nullableText(120, 'Hotel name'),
	checkIn: dateString('Check-in date'),
	checkOut: dateString('Check-out date')
});

const passengers = (label: string, min: number) =>
	z.number(`Enter the number of ${label}`).int('Use a whole number').min(min).max(50, 'For groups over 50, tell us in the notes');

export const flightDetailsSchema = z
	.object({
		tripType: z.enum(TRIP_TYPES, 'Choose a trip type'),
		legs: z.array(flightLegSchema).min(1).max(MAX_FLIGHT_LEGS, `Up to ${MAX_FLIGHT_LEGS} flights`),
		returnDate: dateString('Return date').nullable(),
		adults: passengers('adults', 1),
		children: passengers('children', 0),
		infants: passengers('infants', 0),
		/** null = open to any cabin */
		cabin: z.enum(CABIN_CLASSES).nullable(),
		/** empty = open to any airline */
		airlines: z
			// Names from the Airline table; submitPublicInquiry() keeps only published ones.
			.array(z.string().trim().min(1).max(80))
			.max(MAX_AIRLINES, `Choose up to ${MAX_AIRLINES} airlines, or leave them all open`)
			.refine((a) => new Set(a).size === a.length, 'Each airline only once'),
		flexibleDates: z.boolean(),
		/** null = no accommodation wanted (the whole extras section is optional) */
		accommodation: accommodationSchema.nullable(),
		insurance: z.boolean()
	})
	.superRefine((v, ctx) => {
		const min = earliestDate();
		v.legs.forEach((leg, i) => {
			if (leg.date < min) ctx.addIssue({ code: 'custom', path: ['legs', i, 'date'], message: 'This date has passed' });
			if (leg.from.toLowerCase() === leg.to.toLowerCase()) {
				ctx.addIssue({ code: 'custom', path: ['legs', i, 'to'], message: 'Choose a different destination' });
			}
			const prev = v.legs[i - 1];
			if (prev && leg.date < prev.date) {
				ctx.addIssue({ code: 'custom', path: ['legs', i, 'date'], message: 'Must be on or after the previous flight' });
			}
		});
		if (v.tripType === 'MULTI_CITY' && v.legs.length < 2) {
			ctx.addIssue({ code: 'custom', path: ['legs'], message: 'Add at least two flights for a multi-city trip' });
		}
		if (v.tripType !== 'MULTI_CITY' && v.legs.length !== 1) {
			ctx.addIssue({ code: 'custom', path: ['legs'], message: 'Only one route for this trip type' });
		}
		if (v.tripType === 'RETURN') {
			if (!v.returnDate) ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Return date is required' });
			else if (v.returnDate < v.legs[0].date) {
				ctx.addIssue({ code: 'custom', path: ['returnDate'], message: 'Must be on or after the departure date' });
			}
		}
		if (v.accommodation) {
			const { checkIn, checkOut } = v.accommodation;
			if (checkIn < min) ctx.addIssue({ code: 'custom', path: ['accommodation', 'checkIn'], message: 'This date has passed' });
			if (checkOut <= checkIn) {
				ctx.addIssue({ code: 'custom', path: ['accommodation', 'checkOut'], message: 'Must be after the check-in date' });
			}
		}
		if (v.infants > v.adults) {
			ctx.addIssue({ code: 'custom', path: ['infants'], message: 'Each infant needs an adult on the booking' });
		}
	});

export type FlightDetails = z.output<typeof flightDetailsSchema>;

export const studyDetailsSchema = z.object({
	level: z.enum(STUDY_LEVELS, 'Choose a study level'),
	course: requiredText(150, 'Course'),
	intake: requiredText(60, 'Intake'),
	qualification: nullableText(150, 'Qualification'),
	institutionIds: z
		.array(z.string().min(1).max(40))
		.min(1, 'Choose at least one institution')
		.max(MAX_INSTITUTIONS, `Choose up to ${MAX_INSTITUTIONS} institutions`)
		.refine((a) => new Set(a).size === a.length, 'Each institution only once')
});

export type StudyRequest = z.output<typeof studyDetailsSchema>;
/** What goes in Inquiry.details (institutions are stored as rows). */
export type StudyDetails = Omit<StudyRequest, 'institutionIds'>;

// ---------------------------------------------------------------------------
// FormData → objects (plain form fields so the forms work without JS)
// ---------------------------------------------------------------------------

const str = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const int = (form: FormData, key: string, fallback: number) => {
	const raw = str(form, key);
	return raw === '' ? fallback : Number(raw);
};

/** Reads `legs.N.from|to|date` fields; empty trailing rows are ignored. */
export function readFlightForm(form: FormData) {
	const tripType = str(form, 'tripType') || 'RETURN';
	const legs: { from: string; to: string; date: string }[] = [];
	for (let i = 0; i < MAX_FLIGHT_LEGS + 1; i++) {
		const leg = { from: str(form, `legs.${i}.from`), to: str(form, `legs.${i}.to`), date: str(form, `legs.${i}.date`) };
		if (i === 0 || leg.from || leg.to || leg.date) legs.push(leg);
	}
	return {
		tripType,
		// One-way and return trips only use the first row, whatever else the browser sent.
		legs: tripType === 'MULTI_CITY' ? legs : legs.slice(0, 1),
		returnDate: tripType === 'RETURN' ? str(form, 'returnDate') : null,
		adults: int(form, 'adults', 1),
		children: int(form, 'children', 0),
		infants: int(form, 'infants', 0),
		cabin: str(form, 'cabin') || null,
		airlines: form.getAll('airlines').map(String),
		flexibleDates: form.has('flexibleDates'),
		accommodation: readAccommodation(form),
		insurance: form.has('insurance')
	};
}

/** Null unless "I need accommodation" is ticked; the hidden fields are ignored otherwise. */
function readAccommodation(form: FormData) {
	if (!form.has('wantsAccommodation')) return null;
	const type = str(form, 'accommodation.type');
	return {
		type,
		hotelName: type === 'HOTEL' ? str(form, 'accommodation.hotelName') : '',
		checkIn: str(form, 'accommodation.checkIn'),
		checkOut: str(form, 'accommodation.checkOut')
	};
}

export function readStudyForm(form: FormData) {
	return {
		level: str(form, 'level'),
		course: str(form, 'course'),
		intake: str(form, 'intake'),
		qualification: str(form, 'qualification'),
		institutionIds: form.getAll('institutionIds').map(String)
	};
}

// ---------------------------------------------------------------------------
// Display (dashboard detail card and notification email)
// ---------------------------------------------------------------------------

export type DetailRow = { label: string; value: string };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Short route for the inquiry "interest" line, e.g. "Entebbe (EBB) → Dubai (DXB), Return". */
export function flightSummary(d: Pick<FlightDetails, 'tripType' | 'legs'>) {
	const route =
		d.tripType === 'MULTI_CITY'
			? [d.legs[0].from, ...d.legs.map((l) => l.to)].join(' → ')
			: `${d.legs[0].from} → ${d.legs[0].to}`;
	return `${route} (${tripTypeLabels[d.tripType]})`;
}

/** Whole nights between two "YYYY-MM-DD" dates. */
export const nightsBetween = (checkIn: string, checkOut: string) =>
	Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000);

/** " + hotel + insurance" for the inquiry "interest" line; empty when nothing extra was asked for. */
export function flightExtrasSummary(d: Pick<FlightDetails, 'accommodation' | 'insurance'>) {
	return [d.accommodation && stayTypeLabels[d.accommodation.type].toLowerCase(), d.insurance && 'insurance']
		.filter(Boolean)
		.map((x) => ` + ${x}`)
		.join('');
}

export function passengerSummary(d: Pick<FlightDetails, 'adults' | 'children' | 'infants'>) {
	return [
		plural(d.adults, 'adult'),
		d.children ? `${d.children} ${d.children === 1 ? 'child' : 'children'}` : null,
		d.infants ? plural(d.infants, 'infant') : null
	]
		.filter(Boolean)
		.join(', ');
}

/**
 * Label/value rows for an inquiry's details. Stored JSON is re-validated loosely;
 * anything unreadable yields no rows rather than an error.
 */
export function formatDetails(kind: InquiryKind, details: unknown): DetailRow[] {
	if (!details || typeof details !== 'object') return [];
	if (kind === 'FLIGHT') {
		const d = details as Partial<FlightDetails>;
		if (!d.tripType || !Array.isArray(d.legs) || !d.legs.length) return [];
		const rows: DetailRow[] = [{ label: 'Trip', value: tripTypeLabels[d.tripType] ?? d.tripType }];
		if (d.tripType === 'MULTI_CITY') {
			d.legs.forEach((l, i) => rows.push({ label: `Flight ${i + 1}`, value: `${l.from} → ${l.to}, ${formatDateOnly(l.date)}` }));
		} else {
			const leg = d.legs[0];
			rows.push({ label: 'Route', value: `${leg.from} → ${leg.to}` });
			rows.push({ label: 'Departure', value: formatDateOnly(leg.date) });
			if (d.tripType === 'RETURN' && d.returnDate) rows.push({ label: 'Return', value: formatDateOnly(d.returnDate) });
		}
		if (d.flexibleDates) rows.push({ label: 'Dates', value: 'Flexible' });
		rows.push({
			label: 'Passengers',
			value: passengerSummary({ adults: d.adults ?? 1, children: d.children ?? 0, infants: d.infants ?? 0 })
		});
		rows.push({ label: 'Cabin', value: d.cabin ? (cabinLabels[d.cabin] ?? d.cabin) : 'Any cabin' });
		rows.push({ label: 'Airlines', value: d.airlines?.length ? d.airlines.join(', ') : 'Any airline' });
		const stay = d.accommodation;
		if (stay?.checkIn && stay.checkOut) {
			const type = stayTypeLabels[stay.type] ?? stay.type;
			rows.push({
				label: 'Accommodation',
				value: stay.type === 'HOTEL' ? (stay.hotelName ? `Hotel: ${stay.hotelName}` : 'Hotel, no preference') : type
			});
			const nights = nightsBetween(stay.checkIn, stay.checkOut);
			rows.push({
				label: 'Stay',
				value: `${formatDateOnly(stay.checkIn)} to ${formatDateOnly(stay.checkOut)} (${plural(nights, 'night')})`
			});
		}
		if (d.insurance) rows.push({ label: 'Travel insurance', value: 'Requested' });
		return rows;
	}
	if (kind === 'STUDY_ABROAD') {
		const d = details as Partial<StudyDetails>;
		const rows: DetailRow[] = [];
		if (d.level) rows.push({ label: 'Level', value: studyLevelLabels[d.level] ?? d.level });
		if (d.course) rows.push({ label: 'Course', value: d.course });
		if (d.intake) rows.push({ label: 'Intake', value: d.intake });
		if (d.qualification) rows.push({ label: 'Highest qualification', value: d.qualification });
		return rows;
	}
	return [];
}

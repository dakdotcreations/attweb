import type { InstitutionData } from '#lib/schemas/institutions.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

const order = [{ country: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] as const;

export function listInstitutions() {
	return db.partnerInstitution.findMany({
		orderBy: [...order],
		select: {
			id: true,
			name: true,
			country: true,
			status: true,
			sortOrder: true,
			updatedAt: true,
			logo: { select: mediaRefSelect },
			_count: { select: { inquiries: true } }
		}
	});
}

export function getInstitution(id: string) {
	return db.partnerInstitution.findUnique({
		where: { id },
		include: { logo: { select: mediaRefSelect }, _count: { select: { inquiries: true } } }
	});
}

export function saveInstitution(id: string | null, data: InstitutionData) {
	if (id) return db.partnerInstitution.update({ where: { id }, data, select: { id: true } });
	return db.partnerInstitution.create({ data, select: { id: true } });
}

export function deleteInstitution(id: string) {
	// Inquiries keep the snapshot name/country; their link is cleared (SetNull).
	return db.partnerInstitution.delete({ where: { id } });
}

/** Distinct countries already used, for the editor's suggestions. */
export async function listInstitutionCountries() {
	const rows = await db.partnerInstitution.findMany({ distinct: ['country'], orderBy: { country: 'asc' }, select: { country: true } });
	return rows.map((r) => r.country);
}

/** Published institutions for the public study abroad form, grouped by country in display order. */
export function listPublishedInstitutions() {
	return db.partnerInstitution.findMany({
		where: { status: 'PUBLISHED' },
		orderBy: [...order],
		select: { id: true, name: true, country: true, logo: { select: { thumbUrl: true, alt: true } } }
	});
}

/** Options for the inquiries filter. */
export function listInstitutionOptions() {
	return db.partnerInstitution.findMany({ orderBy: [...order], select: { id: true, name: true, country: true } });
}

/** How many institutions the public study abroad form can show (it falls back to the general form at 0). */
export function countPublishedInstitutions() {
	return db.partnerInstitution.count({ where: { status: 'PUBLISHED' } });
}

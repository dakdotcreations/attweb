import type { MedicalPartnerData } from '#lib/schemas/medical-partners.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

const order = [{ country: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] as const;

export function listMedicalPartners() {
	return db.medicalPartner.findMany({
		orderBy: [...order],
		select: {
			id: true,
			name: true,
			country: true,
			status: true,
			sortOrder: true,
			updatedAt: true,
			logo: { select: mediaRefSelect }
		}
	});
}

export function getMedicalPartner(id: string) {
	return db.medicalPartner.findUnique({ where: { id }, include: { logo: { select: mediaRefSelect } } });
}

export function saveMedicalPartner(id: string | null, data: MedicalPartnerData) {
	if (id) return db.medicalPartner.update({ where: { id }, data, select: { id: true } });
	return db.medicalPartner.create({ data, select: { id: true } });
}

export function deleteMedicalPartner(id: string) {
	// Past medical requests keep the partner's name and country in Inquiry.details.
	return db.medicalPartner.delete({ where: { id } });
}

/** Distinct countries already used, for the editor's suggestions. */
export async function listMedicalPartnerCountries() {
	const rows = await db.medicalPartner.findMany({ distinct: ['country'], orderBy: { country: 'asc' }, select: { country: true } });
	return rows.map((r) => r.country);
}

/** Published partners for the public medical tourism form, in display order. */
export function listPublishedMedicalPartners() {
	return db.medicalPartner.findMany({
		where: { status: 'PUBLISHED' },
		orderBy: [...order],
		select: { id: true, name: true, country: true, logo: { select: { thumbUrl: true, alt: true } } }
	});
}

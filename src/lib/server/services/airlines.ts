import type { AirlineData } from '#lib/schemas/airlines.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

const order = [{ sortOrder: 'asc' }, { name: 'asc' }] as const;

export function listAirlines() {
	return db.airline.findMany({
		orderBy: [...order],
		select: { id: true, name: true, status: true, sortOrder: true, updatedAt: true, logo: { select: mediaRefSelect } }
	});
}

export function getAirline(id: string) {
	return db.airline.findUnique({ where: { id }, include: { logo: { select: mediaRefSelect } } });
}

export function saveAirline(id: string | null, data: AirlineData) {
	if (id) return db.airline.update({ where: { id }, data, select: { id: true } });
	return db.airline.create({ data, select: { id: true } });
}

export function deleteAirline(id: string) {
	// Past flight requests keep the airline name in Inquiry.details.
	return db.airline.delete({ where: { id } });
}

/** Published airline names in display order (flight request form, About page). */
export async function listPublishedAirlineNames() {
	const rows = await db.airline.findMany({ where: { status: 'PUBLISHED' }, orderBy: [...order], select: { name: true } });
	return rows.map((r) => r.name);
}

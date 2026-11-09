import type { ServiceData } from '#lib/schemas/services.js';
import { db } from '../db.js';
import { sanitizeRichText } from '../sanitize.js';

export const mediaRefSelect = { id: true, thumbUrl: true, alt: true, url: true } as const;

export function listServices() {
	return db.service.findMany({
		orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			sortOrder: true,
			updatedAt: true,
			coverImage: { select: mediaRefSelect },
			_count: { select: { packages: true } }
		}
	});
}

/** Lightweight list for tag pickers and selects. */
export function listServiceOptions() {
	return db.service.findMany({
		orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
		select: { id: true, name: true, status: true }
	});
}

export function getService(id: string) {
	return db.service.findUnique({
		where: { id },
		include: { coverImage: { select: mediaRefSelect } }
	});
}

export async function saveService(id: string | null, data: ServiceData) {
	const values = { ...data, content: sanitizeRichText(data.content) };
	if (id) return db.service.update({ where: { id }, data: values, select: { id: true } });
	return db.service.create({ data: values, select: { id: true } });
}

export function deleteService(id: string) {
	// Package tags (PackageService) cascade; blog posts/testimonials keep their content with the link cleared.
	return db.service.delete({ where: { id } });
}

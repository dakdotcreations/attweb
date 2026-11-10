import type { TestimonialData } from '#lib/schemas/testimonials.js';
import { db } from '../db.js';
import { mediaRefSelect } from './services.js';

export function listTestimonials() {
	return db.testimonial.findMany({
		orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
		select: {
			id: true,
			name: true,
			location: true,
			quote: true,
			rating: true,
			featured: true,
			status: true,
			sortOrder: true,
			photo: { select: mediaRefSelect },
			service: { select: { name: true } },
			package: { select: { title: true } }
		}
	});
}

export function getTestimonial(id: string) {
	return db.testimonial.findUnique({
		where: { id },
		include: { photo: { select: mediaRefSelect } }
	});
}

export function saveTestimonial(id: string | null, data: TestimonialData) {
	if (id) return db.testimonial.update({ where: { id }, data, select: { id: true } });
	return db.testimonial.create({ data, select: { id: true } });
}

export function deleteTestimonial(id: string) {
	return db.testimonial.delete({ where: { id } });
}

/** Published testimonials for public pages, featured first. */
export function listPublishedTestimonials(take = 6) {
	return db.testimonial.findMany({
		where: { status: 'PUBLISHED' },
		orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
		take,
		select: {
			id: true,
			name: true,
			location: true,
			quote: true,
			rating: true,
			photo: { select: { thumbUrl: true, alt: true } },
			package: { select: { title: true, slug: true, status: true } },
			service: { select: { name: true, slug: true, status: true } }
		}
	});
}

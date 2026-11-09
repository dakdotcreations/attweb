import type { PackageData } from '#lib/schemas/packages.js';
import { db } from '../db.js';
import type { Prisma } from '../generated/prisma/client.js';
import { sanitizeRichText } from '../sanitize.js';
import { mediaRefSelect } from './services.js';

export async function listPackages(params: { serviceId?: string; q?: string } = {}) {
	const q = params.q?.trim();
	const where: Prisma.TourPackageWhereInput = {
		...(params.serviceId ? { services: { some: { serviceId: params.serviceId } } } : {}),
		...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
	};
	return db.tourPackage.findMany({
		where,
		orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
		select: {
			id: true,
			title: true,
			slug: true,
			status: true,
			featured: true,
			durationDays: true,
			durationNights: true,
			updatedAt: true,
			coverImage: { select: mediaRefSelect },
			services: { select: { service: { select: { id: true, name: true } } } },
			prices: {
				orderBy: [{ isFromPrice: 'desc' }, { sortOrder: 'asc' }],
				take: 1,
				select: { label: true, amountUGX: true, amountUSD: true }
			}
		}
	});
}

export async function getPackage(id: string) {
	const pkg = await db.tourPackage.findUnique({
		where: { id },
		include: {
			coverImage: { select: mediaRefSelect },
			services: { select: { serviceId: true } },
			prices: { orderBy: { sortOrder: 'asc' } },
			highlights: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			inclusions: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			exclusions: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			gallery: { orderBy: { sortOrder: 'asc' }, select: { media: { select: mediaRefSelect } } }
		}
	});
	if (!pkg) return null;
	const { services, highlights, inclusions, exclusions, gallery, ...rest } = pkg;
	return {
		...rest,
		serviceIds: services.map((s) => s.serviceId),
		highlights: highlights.map((h) => h.text),
		inclusions: inclusions.map((i) => i.text),
		exclusions: exclusions.map((e) => e.text),
		gallery: gallery.map((g) => g.media)
	};
}

/** Creates or updates a package and replaces all of its child rows in one transaction. */
export async function savePackage(id: string | null, data: PackageData) {
	const { galleryIds, serviceIds, prices, highlights, inclusions, exclusions, ...fields } = data;
	const scalars = { ...fields, description: sanitizeRichText(fields.description) };
	const ordered = <T>(items: T[]) => items.map((item, sortOrder) => ({ ...item, sortOrder }));
	const texts = (items: string[]) => ordered(items.map((text) => ({ text })));
	const uniqueGallery = [...new Set(galleryIds)];
	const uniqueServices = [...new Set(serviceIds)];

	return db.$transaction(async (tx) => {
		const pkg = id
			? await tx.tourPackage.update({ where: { id }, data: scalars, select: { id: true } })
			: await tx.tourPackage.create({ data: scalars, select: { id: true } });
		const packageId = pkg.id;

		// Sequential on purpose: an interactive transaction runs on a single connection.
		if (id) {
			await tx.packagePrice.deleteMany({ where: { packageId } });
			await tx.tourHighlight.deleteMany({ where: { packageId } });
			await tx.tourInclusion.deleteMany({ where: { packageId } });
			await tx.tourExclusion.deleteMany({ where: { packageId } });
			await tx.packageGalleryImage.deleteMany({ where: { packageId } });
			await tx.packageService.deleteMany({ where: { packageId } });
		}

		await tx.packagePrice.createMany({ data: ordered(prices).map((p) => ({ ...p, packageId })) });
		await tx.tourHighlight.createMany({ data: texts(highlights).map((t) => ({ ...t, packageId })) });
		await tx.tourInclusion.createMany({ data: texts(inclusions).map((t) => ({ ...t, packageId })) });
		await tx.tourExclusion.createMany({ data: texts(exclusions).map((t) => ({ ...t, packageId })) });
		await tx.packageGalleryImage.createMany({
			data: uniqueGallery.map((mediaId, sortOrder) => ({ packageId, mediaId, sortOrder }))
		});
		await tx.packageService.createMany({
			data: uniqueServices.map((serviceId) => ({ packageId, serviceId }))
		});

		return pkg;
	});
}

export function deletePackage(id: string) {
	// Children cascade; testimonials keep their text with the package link cleared.
	return db.tourPackage.delete({ where: { id } });
}

/** Lightweight list for selects. */
export function listPackageOptions() {
	return db.tourPackage.findMany({
		orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
		select: { id: true, title: true }
	});
}

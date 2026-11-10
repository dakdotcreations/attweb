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

/** Published, featured packages with a cover image, for the homepage hero (max 5). */
export async function listFeaturedPackages(take = 5) {
	const packages = await db.tourPackage.findMany({
		where: { status: 'PUBLISHED', featured: true, coverImageId: { not: null } },
		orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
		take,
		select: {
			id: true,
			title: true,
			slug: true,
			summary: true,
			durationDays: true,
			durationNights: true,
			location: true,
			coverImage: { select: { url: true, alt: true, width: true, height: true } },
			prices: {
				orderBy: [{ isFromPrice: 'desc' }, { sortOrder: 'asc' }],
				take: 1,
				select: { label: true, amountUGX: true, amountUSD: true }
			}
		}
	});
	return packages.map(({ prices, coverImage, ...p }) => ({
		...p,
		coverImage: coverImage!,
		fromPrice: prices[0] ?? null
	}));
}

/** Published packages as cards (homepage, tour listings). Featured first, then display order. */
export async function listPublishedPackages(params: { take?: number; serviceSlug?: string } = {}) {
	const packages = await db.tourPackage.findMany({
		where: {
			status: 'PUBLISHED',
			...(params.serviceSlug ? { services: { some: { service: { slug: params.serviceSlug, status: 'PUBLISHED' } } } } : {})
		},
		orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { title: 'asc' }],
		take: params.take,
		select: {
			id: true,
			title: true,
			slug: true,
			summary: true,
			durationDays: true,
			durationNights: true,
			location: true,
			coverImage: { select: { url: true, thumbUrl: true, alt: true } },
			services: {
				where: { service: { status: 'PUBLISHED' } },
				select: { service: { select: { name: true, slug: true } } }
			},
			prices: {
				orderBy: [{ isFromPrice: 'desc' }, { sortOrder: 'asc' }],
				take: 1,
				select: { label: true, amountUGX: true, amountUSD: true }
			}
		}
	});
	return packages.map(({ prices, services, ...p }) => ({
		...p,
		services: services.map((s) => s.service),
		fromPrice: prices[0] ?? null
	}));
}

export type PackageCardData = Awaited<ReturnType<typeof listPublishedPackages>>[number];

/** Full public package page data (published only). */
export async function getPublicPackage(slug: string) {
	const pkg = await db.tourPackage.findFirst({
		where: { slug, status: 'PUBLISHED' },
		select: {
			id: true,
			title: true,
			slug: true,
			summary: true,
			description: true,
			durationDays: true,
			durationNights: true,
			location: true,
			seoTitle: true,
			seoDescription: true,
			updatedAt: true,
			coverImage: { select: { url: true, alt: true, width: true, height: true } },
			services: {
				where: { service: { status: 'PUBLISHED' } },
				select: { service: { select: { id: true, name: true, slug: true } } }
			},
			prices: { orderBy: { sortOrder: 'asc' }, select: { id: true, label: true, amountUGX: true, amountUSD: true, isFromPrice: true } },
			highlights: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			inclusions: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			exclusions: { orderBy: { sortOrder: 'asc' }, select: { text: true } },
			gallery: {
				orderBy: { sortOrder: 'asc' },
				select: { media: { select: { id: true, url: true, thumbUrl: true, alt: true, caption: true, width: true, height: true } } }
			},
			testimonials: {
				where: { status: 'PUBLISHED' },
				orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
				take: 3,
				select: { id: true, name: true, location: true, quote: true, rating: true, photo: { select: { thumbUrl: true } } }
			}
		}
	});
	if (!pkg) return null;
	const fromPrice = pkg.prices.find((p) => p.isFromPrice) ?? pkg.prices[0] ?? null;
	return {
		...pkg,
		services: pkg.services.map((s) => s.service),
		highlights: pkg.highlights.map((h) => h.text),
		inclusions: pkg.inclusions.map((i) => i.text),
		exclusions: pkg.exclusions.map((e) => e.text),
		gallery: pkg.gallery.map((g) => g.media),
		fromPrice
	};
}

/** Other published packages sharing a service with this one (falls back to any). */
export async function listRelatedPackages(packageId: string, serviceIds: string[], take = 3) {
	const related = await listPublishedPackages({ take: take + 6 });
	const others = related.filter((p) => p.id !== packageId);
	if (!serviceIds.length) return others.slice(0, take);
	const ids = new Set(serviceIds);
	const sharing = await db.packageService.findMany({
		where: { serviceId: { in: [...ids] }, packageId: { not: packageId }, package: { status: 'PUBLISHED' } },
		select: { packageId: true }
	});
	const sharingIds = new Set(sharing.map((s) => s.packageId));
	return [...others.filter((p) => sharingIds.has(p.id)), ...others.filter((p) => !sharingIds.has(p.id))].slice(0, take);
}

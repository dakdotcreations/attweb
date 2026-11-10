import { MAX_UPLOAD_BYTES, formatBytes, type MediaItem } from '#lib/media.js';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import type { Prisma } from '../generated/prisma/client.js';
import { MediaValidationError, processImage } from '../media/process.js';
import { deleteBlob, putBlob } from '../storage/azure.js';

export { MediaValidationError };

const mediaSelect = {
	id: true,
	url: true,
	thumbUrl: true,
	filename: true,
	mimeType: true,
	size: true,
	width: true,
	height: true,
	compressed: true,
	alt: true,
	caption: true,
	showInGallery: true,
	galleryCategory: true,
	createdAt: true
} satisfies Prisma.MediaSelect;

/** Validate → process (optionally compress) → upload full + thumbnail → record. */
export async function createMediaFromUpload(input: {
	file: File;
	compress: boolean;
	userId: string;
}): Promise<MediaItem> {
	const { file, compress, userId } = input;
	if (file.size === 0) throw new MediaValidationError('The file is empty.');
	if (file.size > MAX_UPLOAD_BYTES) {
		throw new MediaValidationError(
			`File is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}; resize it before uploading.`
		);
	}

	const processed = await processImage(Buffer.from(await file.arrayBuffer()), compress);

	const now = new Date();
	const prefix = `media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
	const name = randomUUID();
	const blobKey = `${prefix}/${name}.${processed.full.ext}`;
	const thumbBlobKey = `${prefix}/${name}-thumb.${processed.thumb.ext}`;

	const [url, thumbUrl] = await Promise.all([
		putBlob(blobKey, processed.full.data, processed.full.mime),
		putBlob(thumbBlobKey, processed.thumb.data, processed.thumb.mime)
	]);

	try {
		return await db.media.create({
			data: {
				blobKey,
				url,
				thumbBlobKey,
				thumbUrl,
				filename: file.name.slice(0, 255) || 'image',
				mimeType: processed.full.mime,
				size: processed.full.data.byteLength,
				width: processed.full.width,
				height: processed.full.height,
				compressed: processed.compressed,
				uploadedById: userId
			},
			select: mediaSelect
		});
	} catch (err) {
		// Don't leave orphaned blobs if the DB write fails.
		await Promise.allSettled([deleteBlob(blobKey), deleteBlob(thumbBlobKey)]);
		throw err;
	}
}

export async function listMedia(params: {
	q?: string;
	galleryOnly?: boolean;
	page?: number;
	pageSize?: number;
}) {
	const pageSize = params.pageSize ?? 48;
	const page = Math.max(1, params.page ?? 1);
	const q = params.q?.trim();

	const where: Prisma.MediaWhereInput = {
		...(params.galleryOnly ? { showInGallery: true } : {}),
		...(q
			? {
					OR: [
						{ filename: { contains: q, mode: 'insensitive' } },
						{ alt: { contains: q, mode: 'insensitive' } },
						{ caption: { contains: q, mode: 'insensitive' } },
						{ galleryCategory: { contains: q, mode: 'insensitive' } }
					]
				}
			: {})
	};

	const [items, total] = await Promise.all([
		db.media.findMany({
			where,
			select: mediaSelect,
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * pageSize,
			take: pageSize
		}),
		db.media.count({ where })
	]);

	return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Existing gallery categories, for autocomplete. */
export async function listGalleryCategories() {
	const rows = await db.media.findMany({
		where: { galleryCategory: { not: null } },
		distinct: ['galleryCategory'],
		select: { galleryCategory: true },
		orderBy: { galleryCategory: 'asc' }
	});
	return rows.map((r) => r.galleryCategory!).filter(Boolean);
}

export async function updateMedia(
	id: string,
	data: { alt: string; caption: string | null; showInGallery: boolean; galleryCategory: string | null }
) {
	return db.media.update({ where: { id }, data, select: mediaSelect });
}

export async function deleteMedia(id: string) {
	const media = await db.media.delete({
		where: { id },
		select: { blobKey: true, thumbBlobKey: true }
	});
	// Row is gone, so the image is no longer referenced; blob cleanup failures are only logged.
	const results = await Promise.allSettled([deleteBlob(media.blobKey), deleteBlob(media.thumbBlobKey)]);
	for (const r of results) if (r.status === 'rejected') console.error('Blob delete failed', r.reason);
}

// ---------------------------------------------------------------------------
// Public Gallery page
// ---------------------------------------------------------------------------

export const GALLERY_PAGE_SIZE = 36;

/** Categories that have at least one gallery photo, for the public filter. */
export async function listPublicGalleryCategories() {
	const rows = await db.media.findMany({
		where: { showInGallery: true, galleryCategory: { not: null } },
		distinct: ['galleryCategory'],
		select: { galleryCategory: true },
		orderBy: { galleryCategory: 'asc' }
	});
	return rows.map((r) => r.galleryCategory!).filter(Boolean);
}

/** Paginated photos flagged "Show on public Gallery page", newest first. */
export async function listGalleryPhotos(params: { category?: string; page?: number } = {}) {
	const where: Prisma.MediaWhereInput = {
		showInGallery: true,
		...(params.category ? { galleryCategory: params.category } : {})
	};
	const total = await db.media.count({ where });
	const pageCount = Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE));
	const page = Math.min(Math.max(1, params.page ?? 1), pageCount);
	const photos = await db.media.findMany({
		where,
		orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
		skip: (page - 1) * GALLERY_PAGE_SIZE,
		take: GALLERY_PAGE_SIZE,
		select: { id: true, url: true, thumbUrl: true, alt: true, caption: true, width: true, height: true, galleryCategory: true }
	});
	return { photos, total, page, pageCount };
}

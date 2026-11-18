// Media types/constants shared by server and browser code.

/** Per-file upload cap. Vercel rejects request bodies over 4.5 MB; this leaves room for multipart overhead. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Formats accepted for upload (validated server-side by decoding, not by extension). */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Media fields exposed to dashboard pages and pickers. */
export type MediaItem = {
	id: string;
	url: string;
	thumbUrl: string;
	filename: string;
	mimeType: string;
	size: number;
	width: number;
	height: number;
	compressed: boolean;
	alt: string;
	caption: string | null;
	showInGallery: boolean;
	galleryCategory: string | null;
	/** Date from the server load, ISO string when it comes from a JSON endpoint */
	createdAt: Date | string;
};

export function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Minimal image reference used by content forms (cover images, galleries). */
export type MediaRef = Pick<MediaItem, 'id' | 'thumbUrl' | 'alt'> & { url?: string };

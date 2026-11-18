// Upload → Validation → (Compression → Optimization) → ready for Azure.
import sharp from 'sharp';

/** Thrown for problems with the uploaded file itself (shown to the user as-is). */
export class MediaValidationError extends Error {}

const FORMATS: Record<string, { mime: string; ext: string }> = {
	jpeg: { mime: 'image/jpeg', ext: 'jpg' },
	png: { mime: 'image/png', ext: 'png' },
	webp: { mime: 'image/webp', ext: 'webp' },
	avif: { mime: 'image/avif', ext: 'avif' },
	gif: { mime: 'image/gif', ext: 'gif' }
};

/** Refuse decompression bombs: 50 MP covers any real camera photo. */
const MAX_INPUT_PIXELS = 50_000_000;
/** Longest edge of a compressed full-size image. */
const MAX_DIMENSION = 2560;
const THUMB_DIMENSION = 480;

export type ProcessedImage = {
	full: { data: Buffer; mime: string; ext: string; width: number; height: number };
	thumb: { data: Buffer; mime: 'image/webp'; ext: 'webp' };
	compressed: boolean;
};

export async function processImage(input: Buffer, compress: boolean): Promise<ProcessedImage> {
	const options = { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' } as const;

	// Validation: decode the header to learn the real format (never trust the extension or MIME).
	// Header-only read, so no pixel limit here; the explicit check below gives a clear message.
	const meta = await sharp(input, { failOn: 'error', limitInputPixels: false })
		.metadata()
		.catch(() => {
			throw new MediaValidationError('This file is not a supported image, or it is too large in pixels.');
		});
	// sharp reports AVIF as HEIF with AV1 compression; HEIC (HEVC) is not supported.
	const formatName = meta.format === 'heif' && meta.compression === 'av1' ? 'avif' : meta.format;
	const format = formatName ? FORMATS[formatName] : undefined;
	if (!format) {
		const hint = meta.format === 'heif' ? ' Convert iPhone HEIC photos to JPEG first.' : '';
		throw new MediaValidationError(`Unsupported image format. Use JPEG, PNG, WebP, AVIF or GIF.${hint}`);
	}
	// metadata() only reads the header; enforce the pixel cap before decoding anything.
	if (meta.width * meta.height > MAX_INPUT_PIXELS) {
		throw new MediaValidationError(
			`Image is ${meta.width}×${meta.height}, which is too large. Keep it under ${MAX_INPUT_PIXELS / 1_000_000} megapixels.`
		);
	}
	const animated = (meta.pages ?? 1) > 1;

	// Thumbnail is always generated (first frame, upright, small WebP) for grids and pickers.
	const thumb = await sharp(input, options)
		.autoOrient()
		.resize({ width: THUMB_DIMENSION, height: THUMB_DIMENSION, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 72 })
		.toBuffer();

	if (!compress) {
		// Store the original bytes untouched.
		return {
			full: {
				data: input,
				mime: format.mime,
				ext: format.ext,
				width: meta.autoOrient.width,
				height: meta.autoOrient.height
			},
			thumb: { data: thumb, mime: 'image/webp', ext: 'webp' },
			compressed: false
		};
	}

	// Compression + optimization: upright, capped size, metadata stripped, WebP.
	const { data, info } = await sharp(input, { ...options, animated })
		.autoOrient()
		.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 80, effort: 4 })
		.toBuffer({ resolveWithObject: true });

	return {
		full: {
			data,
			mime: 'image/webp',
			ext: 'webp',
			width: info.width,
			height: animated ? (info.pageHeight ?? info.height) : info.height
		},
		thumb: { data: thumb, mime: 'image/webp', ext: 'webp' },
		compressed: true
	};
}

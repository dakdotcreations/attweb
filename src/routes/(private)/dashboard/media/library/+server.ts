// GET ?q=&page= → JSON page of media, used by the MediaPicker dialog.
import { mediaListQuerySchema } from '#lib/schemas/media.js';
import { requireUser } from '#lib/server/guards.js';
import { listMedia } from '#lib/server/services/media.js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	requireUser();
	const query = mediaListQuerySchema.parse(Object.fromEntries(url.searchParams));
	const result = await listMedia({ q: query.q, galleryOnly: query.gallery, page: query.page, pageSize: 24 });
	return json(result);
};

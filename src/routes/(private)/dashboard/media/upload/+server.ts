// POST multipart/form-data: `file` (one image) + `compress` ("true" | "false").
// One file per request keeps each body under Vercel's 4.5 MB limit.
import { requireUser } from '#lib/server/guards.js';
import { createMediaFromUpload, MediaValidationError } from '#lib/server/services/media.js';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const user = requireUser();

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return json({ error: 'Invalid upload request.' }, { status: 400 });
	}

	const file = form.get('file');
	if (!(file instanceof File)) return json({ error: 'No file was sent.' }, { status: 400 });
	const compress = form.get('compress') !== 'false'; // compress unless explicitly disabled

	try {
		const media = await createMediaFromUpload({ file, compress, userId: user.id });
		return json({ media }, { status: 201 });
	} catch (err) {
		if (err instanceof MediaValidationError) {
			return json({ error: err.message }, { status: 422 });
		}
		console.error('Media upload failed', err);
		return json({ error: 'Upload failed. Please try again.' }, { status: 500 });
	}
};

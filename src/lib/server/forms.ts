// Content forms submit their whole state as JSON in a `payload` field
// (see lib/admin/json-form.svelte.ts). These helpers parse and validate it.
import { fail, type ActionFailure } from '@sveltejs/kit';
import type { z } from 'zod';

/** Field errors keyed by dot path, e.g. "title" or "prices.0.amountUSD". `_form` is form-level. */
export type FieldErrors = Record<string, string>;

export type FormFailure = { errors: FieldErrors; message: string };

export function zodFieldErrors(error: z.ZodError): FieldErrors {
	const errors: FieldErrors = {};
	for (const issue of error.issues) {
		const key = issue.path.map(String).join('.') || '_form';
		errors[key] ??= issue.message;
	}
	return errors;
}

export function formFailure(
	errors: FieldErrors,
	message = 'Please fix the highlighted fields.',
	status = 400
): ActionFailure<FormFailure> {
	return fail(status, { errors, message });
}

type Parsed<T> = { ok: true; data: T } | { ok: false; failure: ActionFailure<FormFailure> };

export async function parseJsonPayload<S extends z.ZodType>(
	request: Request,
	schema: S
): Promise<Parsed<z.output<S>>> {
	const raw = (await request.formData()).get('payload');
	let json: unknown;
	try {
		json = JSON.parse(typeof raw === 'string' ? raw : '');
	} catch {
		return { ok: false, failure: formFailure({}, 'The form could not be read. Reload and try again.') };
	}
	const parsed = schema.safeParse(json);
	if (!parsed.success) return { ok: false, failure: formFailure(zodFieldErrors(parsed.error)) };
	return { ok: true, data: parsed.data };
}

/** Prisma unique-constraint violation (P2002), optionally on a specific field. */
export function isUniqueViolation(err: unknown, field?: string) {
	if (typeof err !== 'object' || err === null || (err as { code?: string }).code !== 'P2002') return false;
	if (!field) return true;
	const target = JSON.stringify((err as { meta?: unknown }).meta ?? '');
	return target.includes(field);
}

/** Prisma "record not found" on update/delete (P2025). */
export function isNotFound(err: unknown) {
	return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2025';
}

/** Prisma foreign-key violation (P2003), e.g. a referenced image or service was deleted meanwhile. */
export function isForeignKeyViolation(err: unknown) {
	return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2003';
}

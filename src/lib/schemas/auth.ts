import { z } from 'zod';

export const emailSchema = z.email('Enter a valid email address').trim().toLowerCase();

export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

/** Only allow same-origin relative paths to prevent open redirects. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/dashboard') {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
		return fallback;
	}
	return value;
}

import type { Currency } from '#lib/format.js';
import type { Cookies } from '@sveltejs/kit';

export const CURRENCY_COOKIE = 'currency';
const ONE_YEAR = 60 * 60 * 24 * 365;

const isCurrency = (value: unknown): value is Currency => value === 'UGX' || value === 'USD';

/**
 * Visitor currency: a manual choice (cookie) always wins; otherwise Uganda → UGX,
 * everywhere else → USD. Country comes from Vercel's geo header (absent locally → USD).
 */
export function resolveCurrency(cookies: Cookies, headers: Headers): Currency {
	const chosen = cookies.get(CURRENCY_COOKIE);
	if (isCurrency(chosen)) return chosen;
	return headers.get('x-vercel-ip-country')?.toUpperCase() === 'UG' ? 'UGX' : 'USD';
}

export function setCurrencyCookie(cookies: Cookies, value: unknown) {
	if (!isCurrency(value)) return false;
	cookies.set(CURRENCY_COOKIE, value, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax', httpOnly: false });
	return true;
}

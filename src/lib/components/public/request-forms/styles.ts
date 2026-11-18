// Class names shared by the public request forms (same look as inquiry-form.svelte).
import { cn } from '#lib/utils.js';

export const labelClass = 'text-forest-900 mb-1.5 block text-sm font-semibold';

export const inputClass = (invalid: boolean, extra?: string) =>
	cn(
		'text-ink placeholder:text-ink/40 w-full rounded-md border bg-white px-4 py-3 text-base transition-colors outline-none focus:ring-4',
		invalid ? 'border-crane-red focus:ring-crane-red/15' : 'focus:border-forest-700 focus:ring-forest-700/15 border-forest-900/15',
		extra
	);

/** Pill for radio/checkbox choices; the input inside is sr-only. */
export const chipClass = (active: boolean, disabled = false) =>
	cn(
		'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors has-focus-visible:ring-4 has-focus-visible:ring-forest-700/20',
		active
			? 'bg-forest-800 border-forest-800 text-paper'
			: 'border-forest-900/15 text-forest-900 hover:border-forest-700 bg-white',
		disabled && !active && 'cursor-not-allowed opacity-45 hover:border-forest-900/15'
	);

export const sectionTitleClass = 'font-display text-forest-950 text-lg font-semibold uppercase';

/** Splits an echoed multi-value field ("a|b") back into a list. */
export const splitEcho = (value: string | undefined) => (value ? value.split('|').filter(Boolean) : []);

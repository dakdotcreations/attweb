const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

export function formatDate(value: Date | string | null | undefined) {
	return value ? dateFormat.format(new Date(value)) : '';
}

export function formatDateTime(value: Date | string | null | undefined) {
	return value ? dateTimeFormat.format(new Date(value)) : '';
}

export type Currency = 'UGX' | 'USD';

/** Whole-unit amounts: "UGX 3,500,000" / "USD 950". */
export function formatMoney(amount: number | null | undefined, currency: Currency) {
	if (amount == null) return '';
	return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
}

/** "3 days / 2 nights" */
export function formatDuration(days: number, nights?: number | null) {
	const d = `${days} day${days === 1 ? '' : 's'}`;
	return nights ? `${d} / ${nights} night${nights === 1 ? '' : 's'}` : d;
}

const dateOnlyFormat = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC'
});

/** For date-only values (stored at UTC midnight), so they never shift by a day. */
export function formatDateOnly(value: Date | string | null | undefined) {
	return value ? dateOnlyFormat.format(new Date(value)) : '';
}

/** "YYYY-MM-DD" for <input type="date"> from a date-only value. */
export function toDateInputValue(value: Date | string | null | undefined) {
	return value ? new Date(value).toISOString().slice(0, 10) : '';
}

/** "5 minutes ago", "3 days ago" */
export function formatRelative(value: Date | string) {
	const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const units: [Intl.RelativeTimeFormatUnit, number][] = [
		['year', 31_536_000],
		['month', 2_592_000],
		['week', 604_800],
		['day', 86_400],
		['hour', 3_600],
		['minute', 60]
	];
	for (const [unit, size] of units) {
		if (Math.abs(seconds) >= size) return rtf.format(Math.trunc(seconds / size), unit);
	}
	return 'just now';
}

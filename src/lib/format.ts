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

<!--
	Gold "From" badge in the visitor's currency. If the package has no amount in that
	currency, the other one is shown (the business sets both; there is no conversion).
-->
<script lang="ts">
	import { formatMoney, type Currency } from '#lib/format.js';
	import { cn } from '#lib/utils.js';

	let {
		price,
		currency,
		size = 'md',
		class: className
	}: {
		price: { label: string; amountUGX: number | null; amountUSD: number | null };
		currency: Currency;
		size?: 'md' | 'lg';
		class?: string;
	} = $props();

	const shown = $derived.by(() => {
		const preferred = currency === 'UGX' ? price.amountUGX : price.amountUSD;
		if (preferred != null) return { amount: preferred, currency };
		const other: Currency = currency === 'UGX' ? 'USD' : 'UGX';
		const fallback = other === 'UGX' ? price.amountUGX : price.amountUSD;
		return fallback != null ? { amount: fallback, currency: other } : null;
	});
</script>

{#if shown}
	<div
		class={cn(
			'inline-flex flex-col items-start rounded-2xl bg-linear-to-br from-gold-300 via-gold-500 to-gold-600 text-forest-950 shadow-lg shadow-black/20',
			size === 'lg' ? 'px-5 py-3' : 'px-4 py-2',
			className
		)}
	>
		<span class="text-[0.65rem] font-bold tracking-[0.2em] uppercase opacity-80">From</span>
		<span class={cn('font-extrabold leading-tight tabular-nums', size === 'lg' ? 'text-3xl' : 'text-xl')}>
			{formatMoney(shown.amount, shown.currency)}
		</span>
		<span class="max-w-48 truncate text-[0.7rem] font-semibold opacity-80">{price.label}</span>
	</div>
{/if}

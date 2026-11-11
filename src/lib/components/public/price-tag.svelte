<!--
	"From" price in the visitor's currency. If the package has no amount in that currency, the
	other one is shown (the business sets both; there is no conversion). Tone follows the ground.
-->
<script lang="ts">
	import { formatMoney, type Currency } from '#lib/format.js';
	import { cn } from '#lib/utils.js';

	let {
		price,
		currency,
		size = 'md',
		tone = 'light',
		class: className
	}: {
		price: { label: string; amountUGX: number | null; amountUSD: number | null };
		currency: Currency;
		size?: 'md' | 'lg';
		/** light: on forest grounds; dark: on paper. */
		tone?: 'light' | 'dark';
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
	<div class={cn('inline-flex flex-col items-start leading-none', className)}>
		<span class={cn('text-xs font-bold tracking-[0.16em] uppercase', tone === 'light' ? 'text-gold-300' : 'text-forest-700')}>From</span>
		<span class={cn('font-display mt-2 font-semibold tabular-nums', size === 'lg' ? 'text-5xl' : 'text-3xl', tone === 'light' ? 'text-paper' : 'text-forest-950')}>
			{formatMoney(shown.amount, shown.currency)}
		</span>
		<span class={cn('mt-2 max-w-56 text-xs leading-snug', tone === 'light' ? 'text-paper/65' : 'text-ink/60')}>{price.label}</span>
	</div>
{/if}

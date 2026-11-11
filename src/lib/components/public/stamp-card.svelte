<!--
	Photo card shared by tour packages and services. The photo is the card: name and place sit on
	it in condensed caps. Packages add a paper ticket stub along the bottom (perforated on its top
	edge, the one stamp detail kept) carrying the days and the "from" price; services have no stub.
-->
<script lang="ts" module>
	export type StampPrice = { label: string; amountUGX: number | null; amountUSD: number | null };
</script>

<script lang="ts">
	import type { Currency } from '#lib/format.js';
	import { cn } from '#lib/utils.js';
	import { LOGO } from './site.js';

	let {
		href,
		title,
		image,
		issue,
		meta,
		price = null,
		currency = 'USD',
		size = 'md',
		aspect = 'portrait',
		headingLevel = 3,
		eager = false,
		class: className
	}: {
		href: string;
		title: string;
		image: { url?: string; thumbUrl?: string; alt: string } | null;
		/** Stub, left: e.g. "3 days". */
		issue?: string;
		/** Small line under the title on the photo: place or service. */
		meta?: string | null;
		price?: StampPrice | null;
		currency?: Currency;
		size?: 'md' | 'lg';
		aspect?: 'portrait' | 'square' | 'landscape';
		headingLevel?: 2 | 3;
		eager?: boolean;
		class?: string;
	} = $props();

	const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

	/** The visitor's currency, else the other one (the business sets both; no conversion). */
	const denomination = $derived.by(() => {
		if (!price) return null;
		const preferred = currency === 'UGX' ? price.amountUGX : price.amountUSD;
		if (preferred != null) return { currency, amount: number.format(preferred) };
		const other: Currency = currency === 'UGX' ? 'USD' : 'UGX';
		const fallback = other === 'UGX' ? price.amountUGX : price.amountUSD;
		return fallback != null ? { currency: other, amount: number.format(fallback) } : null;
	});

	const src = $derived(image ? (size === 'lg' ? (image.url ?? image.thumbUrl) : (image.thumbUrl ?? image.url)) : null);
	const stub = $derived(!!(denomination || issue));
</script>

<article
	class={cn(
		'relative flex h-full flex-col overflow-hidden rounded-md ring-1 ring-forest-950/10',
		'group outline-2 outline-offset-3 outline-transparent transition-[outline-color] has-[a:focus-visible]:outline-gold-400',
		className
	)}
>
	<div
		class={cn(
			'bg-forest-800 relative isolate overflow-hidden',
			aspect === 'portrait' ? 'aspect-[4/5]' : aspect === 'landscape' ? 'aspect-[4/5] sm:aspect-[16/10]' : 'aspect-square',
			!stub && 'flex-1'
		)}
	>
		{#if src}
			<img
				{src}
				alt={image?.alt ?? ''}
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
				class="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
			/>
		{:else}
			<!-- No photo yet: the crane mark, never an empty box. -->
			<div class="absolute inset-0 -z-10 flex items-center justify-center">
				<img src={LOGO.mark} alt="" class="w-1/3 opacity-30 grayscale" loading="lazy" />
			</div>
		{/if}
		<div class="absolute inset-0 -z-10 bg-linear-to-t from-black/80 via-black/15 to-transparent"></div>

		<div class={cn('text-paper absolute inset-x-0 bottom-0', size === 'lg' ? 'p-6 sm:p-8' : 'p-4 sm:p-5')}>
			<span class="bg-gold-400 block h-0.5 w-6" aria-hidden="true"></span>
			<svelte:element
				this={`h${headingLevel}`}
				class={cn(
					'font-display mt-3 leading-[0.95] font-semibold text-balance uppercase',
					size === 'lg' ? 'text-4xl sm:text-5xl' : aspect === 'square' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
				)}
			>
				<!-- Stretched link: the whole card is the target. -->
				<a {href} class="after:absolute after:inset-0 focus-visible:outline-none">{title}</a>
			</svelte:element>
			{#if meta}<p class="text-paper/80 mt-2 text-sm">{meta}</p>{/if}
		</div>
	</div>

	{#if stub}
		<!-- Ticket stub: the only paper on the card. -->
		<div class="perforated-top bg-paper text-engrave flex items-end justify-between gap-4 px-4 pt-4 pb-3 sm:px-5">
			<p class="min-w-0 text-xs leading-snug">
				{#if issue}<span class="text-forest-800 block font-bold tracking-[0.16em] uppercase">{issue}</span>{/if}
				{#if denomination && price?.label}<span class="text-engrave/65 block">{price.label}</span>{/if}
			</p>
			{#if denomination}
				<p class="shrink-0 text-right leading-none">
					<span class="text-forest-700 block text-xs font-bold tracking-[0.16em]">FROM {denomination.currency}</span>
					<span class={cn('font-display text-forest-900 mt-1 block font-semibold tabular-nums', size === 'lg' ? 'text-4xl' : 'text-3xl')}>
						{denomination.amount}
					</span>
				</p>
			{/if}
		</div>
	{/if}
</article>

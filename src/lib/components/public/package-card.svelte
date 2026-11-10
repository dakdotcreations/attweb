<!-- Tour package card (homepage, tour listings, related packages). -->
<script lang="ts">
	import { formatDuration, formatMoney, type Currency } from '#lib/format.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	type Card = {
		title: string;
		slug: string;
		summary: string;
		durationDays: number;
		durationNights: number | null;
		location: string | null;
		coverImage: { url: string; thumbUrl: string; alt: string } | null;
		services: { name: string; slug: string }[];
		fromPrice: { label: string; amountUGX: number | null; amountUSD: number | null } | null;
	};

	let { pkg, currency }: { pkg: Card; currency: Currency } = $props();

	const price = $derived.by(() => {
		const p = pkg.fromPrice;
		if (!p) return null;
		const preferred = currency === 'UGX' ? p.amountUGX : p.amountUSD;
		if (preferred != null) return formatMoney(preferred, currency);
		const other = currency === 'UGX' ? p.amountUSD : p.amountUGX;
		return other != null ? formatMoney(other, currency === 'UGX' ? 'USD' : 'UGX') : null;
	});
</script>

<article class="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_0_rgb(0_0_0_/_0.04),0_12px_40px_-18px_rgb(11_61_36_/_0.35)] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-[0_24px_60px_-20px_rgb(11_61_36_/_0.45)]">
	<div class="bg-forest-100 relative aspect-[4/3] overflow-hidden">
		{#if pkg.coverImage}
			<img
				src={pkg.coverImage.url}
				alt={pkg.coverImage.alt}
				loading="lazy"
				decoding="async"
				class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
		{/if}
		<div class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent"></div>
		{#if pkg.services.length}
			<p class="absolute top-4 left-4 flex flex-wrap gap-1.5">
				{#each pkg.services.slice(0, 2) as service (service.slug)}
					<span class="bg-cream/90 text-forest-900 rounded-full px-2.5 py-1 text-[0.7rem] font-bold tracking-wide backdrop-blur">
						{service.name}
					</span>
				{/each}
			</p>
		{/if}
		{#if price}
			<p class="from-gold-300 via-gold-500 to-gold-600 text-forest-950 absolute bottom-4 left-4 rounded-full bg-linear-to-br px-3.5 py-1.5 text-sm font-extrabold shadow-lg shadow-black/25">
				<span class="text-[0.65rem] tracking-widest uppercase opacity-80">From</span>
				<span class="tabular-nums">{price}</span>
			</p>
		{/if}
	</div>

	<div class="flex flex-1 flex-col p-6">
		<p class="text-forest-700 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
			<span class="inline-flex items-center gap-1"><ClockIcon class="size-3.5" />{formatDuration(pkg.durationDays, pkg.durationNights)}</span>
			{#if pkg.location}
				<span class="inline-flex items-center gap-1"><MapPinIcon class="size-3.5" />{pkg.location}</span>
			{/if}
		</p>
		<h3 class="text-forest-950 mt-3 text-xl leading-snug font-extrabold text-balance">
			<!-- Stretched link: the whole card is clickable. -->
			<a href="/tours/{pkg.slug}" class="after:absolute after:inset-0 focus-visible:outline-none">{pkg.title}</a>
		</h3>
		{#if pkg.summary}
			<p class="text-ink/70 mt-2 line-clamp-2 text-sm">{pkg.summary}</p>
		{/if}
		<p class="text-forest-800 mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold">
			View journey
			<ArrowRightIcon class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
		</p>
	</div>
	<!-- Focus ring for the stretched link. -->
	<span class="group-has-[a:focus-visible]:ring-gold-500 pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-transparent"></span>
</article>

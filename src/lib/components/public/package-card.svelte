<!-- Tour package as a photo card with a ticket stub (homepage, tour listings, related packages). -->
<script lang="ts">
	import type { Currency } from '#lib/format.js';
	import StampCard from './stamp-card.svelte';

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

	let {
		pkg,
		currency,
		size = 'md',
		eager = false,
		class: className
	}: { pkg: Card; currency: Currency; size?: 'md' | 'lg'; eager?: boolean; class?: string } = $props();

	const issue = $derived(`${pkg.durationDays} day${pkg.durationDays === 1 ? '' : 's'}`);
</script>

<StampCard
	href="/tours/{pkg.slug}"
	title={pkg.title}
	image={pkg.coverImage}
	{issue}
	meta={pkg.location ?? pkg.services[0]?.name}
	price={pkg.fromPrice}
	{currency}
	{size}
	aspect={size === 'lg' ? 'landscape' : 'portrait'}
	{eager}
	class={className}
/>

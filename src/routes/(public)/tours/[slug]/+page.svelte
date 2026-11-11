<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import { page } from '$app/state';
	import InquiryForm from '#lib/components/public/inquiry-form.svelte';
	import PackageCard from '#lib/components/public/package-card.svelte';
	import PhotoGallery from '#lib/components/public/photo-gallery.svelte';
	import { portal } from '#lib/components/public/portal.js';
	import PriceTag from '#lib/components/public/price-tag.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import WhatsAppButton from '#lib/components/public/whatsapp-button.svelte';
	import { formatDuration, formatMoney } from '#lib/format.js';
	import { useGsap } from '#lib/hooks/UseGsap.svelte.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import XIcon from '@lucide/svelte/icons/x';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const pkg = $derived(data.pkg);
	const currency = $derived(data.currency);
	const duration = $derived(formatDuration(pkg.durationDays, pkg.durationNights));
	const whatsappMessage = $derived(`Hi Altura, I'm interested in "${pkg.title}". Could you share more details?`);
	const metaTitle = $derived(pkg.seoTitle || `${pkg.title} | ${data.site.companyName}`);
	const metaDescription = $derived(pkg.seoDescription || pkg.summary);

	/** Amount in the visitor's currency, else the other one. */
	function amount(p: { amountUGX: number | null; amountUSD: number | null }) {
		const primary = currency === 'UGX' ? p.amountUGX : p.amountUSD;
		if (primary != null) return { main: formatMoney(primary, currency), alt: formatMoney(currency === 'UGX' ? p.amountUSD : p.amountUGX, currency === 'UGX' ? 'USD' : 'UGX') };
		const other = currency === 'UGX' ? p.amountUSD : p.amountUGX;
		return { main: formatMoney(other, currency === 'UGX' ? 'USD' : 'UGX'), alt: '' };
	}

	// Structured data for search engines.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'TouristTrip',
			name: pkg.title,
			description: metaDescription || undefined,
			image: pkg.coverImage?.url,
			url: page.url.href,
			touristType: pkg.services.map((s) => s.name),
			provider: { '@type': 'TravelAgency', name: data.site.companyName },
			offers: pkg.prices
				.flatMap((p) => [
					p.amountUSD != null && { '@type': 'Offer', name: p.label, price: p.amountUSD, priceCurrency: 'USD' },
					p.amountUGX != null && { '@type': 'Offer', name: p.label, price: p.amountUGX, priceCurrency: 'UGX' }
				])
				.filter(Boolean)
		}).replace(/</g, '\\u003c')
	);

	// Sticky booking card. ScrollSmoother transforms the page, so CSS sticky can't work:
	// pin with ScrollTrigger on large screens instead (created after the smoother exists).
	let layout = $state<HTMLElement>();
	let aside = $state<HTMLElement>();
	useGsap(
		({ gsap, ScrollTrigger }) => {
			const mm = gsap.matchMedia();
			mm.add('(min-width: 1024px)', () => {
				ScrollTrigger.create({
					trigger: aside,
					pin: aside,
					start: 'top 104px',
					endTrigger: layout,
					end: () => `bottom ${104 + (aside?.offsetHeight ?? 0)}px`,
					pinSpacing: false,
					invalidateOnRefresh: true
				});
			});
			return () => mm.revert();
		},
		undefined,
		{ afterSmoother: true }
	);
</script>

<Seo
	site={data.site}
	title={metaTitle}
	description={metaDescription}
	ogTitle={pkg.title}
	image={pkg.coverImage?.url}
	imageAlt={pkg.coverImage?.alt}
>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</Seo>

<!-- Hero -->
<section class="bg-forest-950 relative isolate flex min-h-[70svh] items-end overflow-hidden">
	{#if pkg.coverImage}
		<img
			src={pkg.coverImage.url}
			alt={pkg.coverImage.alt}
			fetchpriority="high"
			data-speed="0.85"
			class="absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover"
		/>
	{/if}
	<div class="from-forest-950 via-forest-950/50 absolute inset-0 -z-10 bg-linear-to-t to-black/30"></div>

	<div class="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-14 sm:px-6 lg:px-8" {@attach reveal({ selector: '[data-reveal]', stagger: 0.08, start: 'top 95%' })}>
		<nav data-reveal aria-label="Breadcrumb" class="text-paper/70 text-xs font-semibold">
			<ol class="flex flex-wrap items-center gap-2">
				<li><a href="/" class="hover:text-gold-300">Home</a></li>
				<li aria-hidden="true">/</li>
				<li><a href="/tours" class="hover:text-gold-300">Tours</a></li>
			</ol>
		</nav>
		{#if pkg.services.length}
			<p data-reveal class="mt-5 flex flex-wrap gap-2">
				{#each pkg.services as service (service.id)}
					<a href="/services/{service.slug}" class="bg-paper/15 text-paper hover:bg-paper/25 rounded-full px-3 py-1 text-xs font-bold backdrop-blur">{service.name}</a>
				{/each}
			</p>
		{/if}
		<h1 data-reveal class="font-display text-paper mt-4 max-w-4xl text-4xl leading-[0.95] font-semibold uppercase text-balance sm:text-6xl">
			{pkg.title}
		</h1>
		<p data-reveal class="text-paper/90 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
			<span class="inline-flex items-center gap-1.5"><ClockIcon class="text-gold-400 size-4" />{duration}</span>
			{#if pkg.location}<span class="inline-flex items-center gap-1.5"><MapPinIcon class="text-gold-400 size-4" />{pkg.location}</span>{/if}
		</p>
		{#if pkg.summary}<p data-reveal class="text-paper/80 mt-4 max-w-2xl text-lg">{pkg.summary}</p>{/if}
	</div>
</section>

<!-- Body + sticky booking card -->
<div bind:this={layout} class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:px-8 lg:py-20">
	<div class="min-w-0 space-y-16">
		{#if pkg.description}
			<section aria-labelledby="overview-title" {@attach reveal()}>
				<h2 id="overview-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Overview</h2>
				<!-- Sanitized on save (lib/server/sanitize.ts). -->
				<div class="prose prose-stone prose-a:text-forest-700 prose-headings:font-display prose-headings:uppercase prose-headings:font-semibold prose-headings:text-forest-900 mt-6 max-w-none">
					{@html pkg.description}
				</div>
			</section>
		{/if}

		{#if pkg.highlights.length}
			<section aria-labelledby="highlights-title">
				<h2 id="highlights-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Highlights</h2>
				<ul class="mt-8 grid gap-4 sm:grid-cols-2" {@attach reveal({ selector: ':scope > li', stagger: 0.06, y: 20 })}>
					{#each pkg.highlights as highlight, i (highlight)}
						<li class="border-forest-950/15 flex gap-4 border-t pt-4">
							<span class="font-display text-forest-700 w-9 shrink-0 text-2xl leading-none font-semibold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
							<span class="text-ink/85 self-center text-base font-medium">{highlight}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if pkg.gallery.length}
			<section aria-labelledby="gallery-title" {@attach reveal()}>
				<h2 id="gallery-title" class="font-display text-forest-950 mb-8 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Gallery</h2>
				<PhotoGallery photos={pkg.gallery} title={pkg.title} />
			</section>
		{/if}

		{#if pkg.inclusions.length || pkg.exclusions.length}
			<section aria-labelledby="included-title">
				<h2 id="included-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">What's included</h2>
				<div class="mt-8 grid gap-6 md:grid-cols-2" {@attach reveal({ selector: ':scope > div', stagger: 0.1 })}>
					{#if pkg.inclusions.length}
						<div class="rounded-md bg-white p-7 ring-1 ring-forest-950/10">
							<h3 class="text-forest-900 text-lg font-extrabold">Included</h3>
							<ul class="mt-5 space-y-3">
								{#each pkg.inclusions as item (item)}
									<li class="flex gap-3 text-base">
										<CheckIcon class="text-forest-700 mt-0.5 size-5 shrink-0" />{item}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if pkg.exclusions.length}
						<div class="bg-paper-200 rounded-md p-7 ring-1 ring-forest-950/10">
							<h3 class="text-forest-900 text-lg font-extrabold">Not included</h3>
							<ul class="mt-5 space-y-3">
								{#each pkg.exclusions as item (item)}
									<li class="text-ink/75 flex gap-3 text-base">
										<XIcon class="text-ink/35 mt-0.5 size-5 shrink-0" />{item}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</section>
		{/if}

		{#if pkg.prices.length}
			<section aria-labelledby="pricing-title" {@attach reveal()}>
				<h2 id="pricing-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Pricing</h2>
				<div class="mt-8 overflow-hidden rounded-md bg-white ring-1 ring-forest-950/10">
					<table class="w-full text-left text-sm">
						<thead class="bg-forest-950 text-paper">
							<tr>
								<th scope="col" class="px-6 py-4 font-bold">Option</th>
								<th scope="col" class="px-6 py-4 text-right font-bold">Price</th>
							</tr>
						</thead>
						<tbody class="divide-forest-900/10 divide-y">
							{#each pkg.prices as price (price.id)}
								{@const a = amount(price)}
								<tr>
									<th scope="row" class="text-ink px-6 py-4 font-semibold">
										{price.label}
										{#if price.isFromPrice}<span class="bg-forest-100 text-forest-800 ml-2 rounded-full px-2 py-0.5 text-xs font-bold">Starting price</span>{/if}
									</th>
									<td class="px-6 py-4 text-right">
										<span class="text-forest-900 block text-base font-extrabold tabular-nums">{a.main}</span>
										{#if a.alt}<span class="text-ink/50 text-xs tabular-nums">{a.alt}</span>{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="text-ink/60 mt-3 text-sm">Prices can be tailored to your dates, group size and choice of lodges. Ask us for a quote.</p>
			</section>
		{/if}

		{#if pkg.testimonials.length}
			<section aria-labelledby="reviews-title" {@attach reveal()}>
				<h2 id="reviews-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">What travellers say</h2>
				<div class="mt-8 grid gap-5">
					{#each pkg.testimonials as t (t.id)}
						<blockquote class="rounded-md bg-white p-7 ring-1 ring-forest-950/10">
							<p class="text-ink/85 leading-relaxed">“{t.quote}”</p>
							<footer class="text-forest-900 mt-4 text-sm font-extrabold">
								{t.name}{#if t.location}<span class="text-ink/55 font-medium"> · {t.location}</span>{/if}
							</footer>
						</blockquote>
					{/each}
				</div>
			</section>
		{/if}

		<section id="inquire" aria-labelledby="inquire-title" class="scroll-mt-28">
			<h2 id="inquire-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Inquire about this journey</h2>
			<p class="text-ink/70 mt-3">Send us your dates and group size and we'll get back to you with availability and a tailored quote.</p>
			<div class="mt-8">
				<InquiryForm
					packageId={pkg.id}
					about={pkg.title}
					whatsappNumber={data.site.whatsappNumber}
					messagePlaceholder="Your preferred dates, who's travelling, the kind of lodges you like, any questions…"
				/>
			</div>
		</section>
	</div>

	<!-- Booking card (pinned on desktop) -->
	<aside bind:this={aside} class="hidden self-start lg:block" aria-label="Book this journey">
		<div class="bg-forest-900 text-paper overflow-hidden rounded-md p-7">
			{#if pkg.fromPrice}<PriceTag price={pkg.fromPrice} {currency} size="lg" />{/if}
			<dl class="mt-6 space-y-3 text-sm">
				<div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
					<dt class="text-paper/60">Duration</dt><dd class="font-semibold">{duration}</dd>
				</div>
				{#if pkg.location}
					<div class="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
						<dt class="text-paper/60">Location</dt><dd class="text-right font-semibold">{pkg.location}</dd>
					</div>
				{/if}
				{#if pkg.prices.length > 1}
					<div class="flex items-center justify-between gap-4">
						<dt class="text-paper/60">Options</dt><dd class="font-semibold">{pkg.prices.length} price tiers</dd>
					</div>
				{/if}
			</dl>
			<div class="mt-7 grid gap-3">
				<a href="#inquire" class="bg-paper text-forest-900 hover:bg-gold-300 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors">
					Inquire now <ArrowRightIcon class="size-4" />
				</a>
				<WhatsAppButton number={data.site.whatsappNumber} message={whatsappMessage} size="lg" class="w-full" />
			</div>
			<p class="text-paper/55 mt-5 text-center text-xs">No payment needed to inquire</p>
		</div>
	</aside>
</div>

{#if data.related.length}
	<section class="bg-forest-900 py-20 sm:py-28" aria-labelledby="related-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h2 id="related-title" class="font-display text-paper text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">You might also like</h2>
			<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
				{#each data.related as related (related.id)}
					<li><PackageCard pkg={related} {currency} /></li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<div class="h-20 lg:hidden" aria-hidden="true"></div>

<!--
	Mobile booking bar: moved to <body> so `fixed` isn't broken by the smooth-scroll transform.
	The wrapper stays in place: a portaled node must never be the first or last node of a
	component, or Svelte walks past it when unmounting and removes the next page too.
-->
<div class="contents">
<div
	{@attach portal}
	class="bg-paper/95 fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-gold-500/30 px-4 pt-3 backdrop-blur-md lg:hidden"
	style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))"
>
	{#if pkg.fromPrice}
		{@const a = amount(pkg.fromPrice)}
		<p class="leading-tight">
			<span class="text-ink/60 block text-xs font-bold tracking-wider uppercase">From</span>
			<span class="text-forest-900 text-lg font-extrabold tabular-nums">{a.main}</span>
		</p>
	{:else}
		<p class="text-forest-900 text-sm font-bold">{duration}</p>
	{/if}
	<a href="#inquire" class="bg-forest-800 text-paper rounded-full px-6 py-3 text-sm font-bold">Inquire now</a>
</div>
</div>

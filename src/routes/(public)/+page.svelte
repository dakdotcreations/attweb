<script lang="ts">
	import { page } from '$app/state';
	import AlbumClose from '#lib/components/public/home/album-close.svelte';
	import JourneySheet from '#lib/components/public/home/journey-sheet.svelte';
	import PostmarkedQuotes from '#lib/components/public/home/postmarked-quotes.svelte';
	import ServiceHero from '#lib/components/public/home/service-hero.svelte';
	import Seo from '#lib/components/public/seo.svelte';
	import { LOGO } from '#lib/components/public/site.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Business details for search engines. "<" is escaped so content can't close the script tag.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'TravelAgency',
			name: data.site.companyName,
			slogan: data.site.tagline || undefined,
			url: page.url.origin,
			logo: page.url.origin + LOGO.full,
			image: data.site.ogImageUrl || undefined,
			email: data.site.email || undefined,
			telephone: data.site.phone || undefined,
			address: data.site.address ? { '@type': 'PostalAddress', streetAddress: data.site.address, addressCountry: 'UG' } : undefined,
			sameAs: Object.values(data.site.socials).filter(Boolean)
		}).replace(/</g, '\u003c')
	);
</script>

<Seo site={data.site}>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</Seo>

<ServiceHero
	services={data.servicesWithCovers}
	fallbackImage={data.site.ogImageUrl}
	whatsappNumber={data.site.whatsappNumber}
	companyName={data.site.companyName}
/>
<JourneySheet packages={data.journeys} currency={data.currency} />
<PostmarkedQuotes testimonials={data.testimonials} />
<AlbumClose
	photos={data.albumPhotos}
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
/>

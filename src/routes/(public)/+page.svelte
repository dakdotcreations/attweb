<script lang="ts">
	import { page } from '$app/state';
	import { LOGO } from '#lib/components/public/site.js';
	import Seo from '#lib/components/public/seo.svelte';
	import HeroSlider from '#lib/components/public/hero-slider.svelte';
	import LatestStories from '#lib/components/public/home/latest-stories.svelte';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import PopularJourneys from '#lib/components/public/home/popular-journeys.svelte';
	import SignatureExperiences from '#lib/components/public/home/signature-experiences.svelte';
	import TestimonialsSection from '#lib/components/public/home/testimonials-section.svelte';
	import WhyAltura from '#lib/components/public/home/why-altura.svelte';
	import ServicesStrip from '#lib/components/public/services-strip.svelte';
	import TrustBand from '#lib/components/public/trust-band.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Background for the closing CTA: the first signature service's photo, else the sharing image.
	const ctaImage = $derived(data.servicesWithCovers.find((s) => s.coverImage?.url)?.coverImage?.url ?? data.site.ogImageUrl);

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
		}).replace(/</g, '\\u003c')
	);
</script>

<Seo site={data.site}>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</Seo>

<h1 class="sr-only">{data.site.companyName}: gorilla trekking, safaris and travel from Kampala, Uganda</h1>

<HeroSlider
	slides={data.featured}
	currency={data.currency}
	whatsappNumber={data.site.whatsappNumber}
	fallbackImage={data.site.ogImageUrl}
/>
<ServicesStrip services={data.services} />
<TrustBand address={data.site.address} />

<PopularJourneys packages={data.journeys} currency={data.currency} />
<SignatureExperiences services={data.servicesWithCovers} />
<WhyAltura />
<TestimonialsSection testimonials={data.testimonials} />
<LatestStories posts={data.posts} />
<div class="bg-cream-200/60">
    <PlanCta
    	whatsappNumber={data.site.whatsappNumber}
    	email={data.site.email}
    	address={data.site.address}
    	officeHours={data.site.officeHours}
    	image={ctaImage}
    />
</div>

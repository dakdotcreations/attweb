<script lang="ts">
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
</script>

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

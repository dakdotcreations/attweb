<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import LatestStories from '#lib/components/public/home/latest-stories.svelte';
	import InquiryForm from '#lib/components/public/inquiry-form.svelte';
	import PackageCard from '#lib/components/public/package-card.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import ServiceCard from '#lib/components/public/service-card.svelte';
	import TestimonialCard from '#lib/components/public/testimonial-card.svelte';
	import WhatsAppButton from '#lib/components/public/whatsapp-button.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const service = $derived(data.service);
	const metaTitle = $derived(service.seoTitle || `${service.name} | ${data.site.companyName}`);
	const metaDescription = $derived(service.seoDescription || service.summary);
</script>

<Seo
	site={data.site}
	title={metaTitle}
	description={metaDescription}
	ogTitle={service.name}
	image={service.coverImage?.url}
	imageAlt={service.coverImage?.alt}
/>

<section class="bg-forest-950 relative isolate flex min-h-[62svh] items-end overflow-hidden">
	{#if service.coverImage}
		<img
			src={service.coverImage.url}
			alt={service.coverImage.alt}
			fetchpriority="high"
			data-speed="0.85"
			class="absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover"
		/>
	{/if}
	<div class="from-forest-950 via-forest-950/55 absolute inset-0 -z-10 bg-linear-to-t to-black/30"></div>
	<div class="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-14 sm:px-6 lg:px-8" {@attach reveal({ selector: '[data-reveal]', stagger: 0.08, start: 'top 95%' })}>
		<nav data-reveal aria-label="Breadcrumb" class="text-paper/70 text-xs font-semibold">
			<ol class="flex flex-wrap items-center gap-2">
				<li><a href="/" class="hover:text-gold-300">Home</a></li>
				<li aria-hidden="true">/</li>
				<li><a href="/services" class="hover:text-gold-300">Services</a></li>
			</ol>
		</nav>
		<span data-reveal class="bg-gold-400 mt-8 block h-0.5 w-10" aria-hidden="true"></span>
		<h1 data-reveal class="font-display text-paper mt-5 max-w-4xl text-5xl leading-[0.95] font-semibold uppercase text-balance sm:text-7xl lg:text-8xl">{service.name}</h1>
		{#if service.summary}<p data-reveal class="text-paper/80 mt-5 max-w-2xl text-lg">{service.summary}</p>{/if}
		<div data-reveal class="mt-8 flex flex-wrap gap-3">
			<a href="#inquire" class="bg-paper text-forest-900 hover:bg-gold-300 inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-bold transition-colors">
				Ask about {service.name} <ArrowRightIcon class="size-4" />
			</a>
			<WhatsAppButton number={data.site.whatsappNumber} message={`Hi Altura, I'd like to know more about ${service.name}.`} size="lg" />
		</div>
	</div>
</section>

{#if service.content}
	<section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24" {@attach reveal()}>
		<!-- Sanitized on save (lib/server/sanitize.ts). -->
		<div class="prose prose-lg prose-stone prose-a:text-forest-700 prose-headings:font-display prose-headings:uppercase prose-headings:font-semibold prose-headings:text-forest-900 max-w-none">
			{@html service.content}
		</div>
	</section>
{/if}

{#if data.packages.length}
	<section class="bg-forest-950 py-20 sm:py-28" aria-labelledby="packages-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<h2 id="packages-title" class="font-display text-paper text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">{service.name} packages</h2>
				<a href="/tours?service={service.slug}" class="border-paper/50 hover:bg-paper hover:text-forest-950 text-paper inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors">
					View all <ArrowRightIcon class="size-4" />
				</a>
			</div>
			<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
				{#each data.packages as pkg (pkg.id)}
					<li><PackageCard {pkg} currency={data.currency} /></li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

{#if service.testimonials.length}
	<section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="svc-reviews-title">
		<h2 id="svc-reviews-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">What travellers say</h2>
		<ul class="mt-10 grid gap-6 md:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
			{#each service.testimonials as t (t.id)}<li><TestimonialCard testimonial={t} /></li>{/each}
		</ul>
	</section>
{/if}

<LatestStories posts={service.blogPosts} />

<section id="inquire" class="bg-forest-900 text-paper scroll-mt-28" aria-labelledby="svc-inquire-title">
<div class="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8 lg:py-28">
	<div {@attach reveal()}>
		<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
		<h2 id="svc-inquire-title" class="font-display text-paper mt-5 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">Ask us about {service.name}</h2>
		<p class="text-paper/75 mt-5 text-lg leading-relaxed">
			Tell us a little about what you need. We'll reply with options and prices. No payment is needed to ask.
		</p>
	</div>
	<InquiryForm serviceId={service.id} about={service.name} whatsappNumber={data.site.whatsappNumber} />
</div>
</section>

{#if data.otherServices.length}
	<section class="bg-paper-200 py-20" aria-labelledby="other-services-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h2 id="other-services-title" class="font-display text-forest-950 text-4xl leading-[0.95] font-semibold uppercase sm:text-5xl">More ways we can help</h2>
			<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
				{#each data.otherServices as s (s.id)}<li><ServiceCard service={s} /></li>{/each}
			</ul>
		</div>
	</section>
{/if}

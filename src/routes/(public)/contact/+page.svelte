<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import BrandIcon from '#lib/components/public/brand-icon.svelte';
	import InquiryForm from '#lib/components/public/inquiry-form.svelte';
	import PageHero from '#lib/components/public/page-hero.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { whatsappLink } from '#lib/inquiries.js';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const site = $derived(data.site);
	const whatsapp = $derived(whatsappLink(site.whatsappNumber, "Hi Altura, I'd like to plan a trip."));
	const mapsUrl = $derived(
		site.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}`)}` : null
	);
</script>

<Seo
	site={site}
	title="Contact us | {site.companyName}"
	description="Plan your safari or trip with {site.companyName}. Message us on WhatsApp, email, or visit our office on Kampala Road."
/>

<PageHero
	title="Let's plan your journey"
	intro="Tell us what you have in mind and we'll put together options for you. Prefer to chat? We're on WhatsApp."
/>

<section class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8 lg:py-24">
	<div {@attach reveal()}>
		<h2 class="font-display text-forest-950 mb-6 text-2xl font-semibold uppercase">Send us an inquiry</h2>
		<InquiryForm
			packageId={data.preselectPackage?.id ?? null}
			about={data.preselectPackage?.title ?? null}
			services={data.preselectPackage ? [] : data.services}
			serviceId={data.preselectServiceId}
			whatsappNumber={site.whatsappNumber}
			initial={{ serviceId: data.preselectServiceId ?? '', ...(form && 'values' in form ? form.values : {}) }}
			initialErrors={form && 'errors' in form ? form.errors : {}}
			initialSuccess={form && 'success' in form ? { number: form.number ?? null } : null}
		/>
	</div>

	<aside class="space-y-6" {@attach reveal({ selector: ':scope > *', stagger: 0.1, delay: 0.1 })}>
		{#if whatsapp}
			<a
				href={whatsapp}
				target="_blank"
				rel="noopener noreferrer"
				class="bg-whatsapp hover:bg-whatsapp-dark group flex items-center gap-4 rounded-md p-6 text-white transition-colors"
			>
				<span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20">
					<BrandIcon name="whatsapp" class="size-7" />
				</span>
				<span>
					<span class="block text-lg font-extrabold">Chat on WhatsApp</span>
					<span class="text-sm text-white/85">The fastest way to reach us · {site.whatsappNumber}</span>
				</span>
			</a>
		{/if}

		<div class="bg-forest-900 text-paper/85 rounded-md p-7">
			<h2 class="font-display text-paper text-lg font-semibold uppercase">Visit or call us</h2>
			<ul class="mt-5 space-y-4 text-sm">
				{#if site.address}
					<li class="flex gap-3">
						<MapPinIcon class="text-gold-400 mt-0.5 size-5 shrink-0" />
						<span>
							<span class="whitespace-pre-line">{site.address}</span>
							{#if mapsUrl}
								<a href={mapsUrl} target="_blank" rel="noopener noreferrer" class="text-gold-400 hover:text-gold-300 mt-1 flex items-center gap-1 text-xs font-bold">
									Open in Google Maps <ExternalLinkIcon class="size-3" />
								</a>
							{/if}
						</span>
					</li>
				{/if}
				{#if site.phone}
					<li class="flex gap-3">
						<PhoneIcon class="text-gold-400 mt-0.5 size-5 shrink-0" />
						<a href="tel:{site.phone.replace(/[^\d+]/g, '')}" class="hover:text-gold-300">{site.phone}</a>
					</li>
				{/if}
				{#if site.email}
					<li class="flex gap-3">
						<MailIcon class="text-gold-400 mt-0.5 size-5 shrink-0" />
						<a href="mailto:{site.email}" class="hover:text-gold-300 break-all">{site.email}</a>
					</li>
				{/if}
				{#if site.officeHours}
					<li class="flex gap-3"><ClockIcon class="text-gold-400 mt-0.5 size-5 shrink-0" /><span>{site.officeHours}</span></li>
				{/if}
			</ul>
		</div>

		<p class="text-ink/60 px-2 text-sm">
			For urgent travel matters, WhatsApp is quickest.
		</p>
	</aside>
</section>

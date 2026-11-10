<!-- Closing call to action: Plan my trip (contact page) + WhatsApp + office details. -->
<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import { reveal } from '../reveal.js';
	import WhatsAppButton from '../whatsapp-button.svelte';

	let {
		whatsappNumber,
		email,
		address,
		officeHours,
		image = null
	}: {
		whatsappNumber: string | null;
		email: string | null;
		address: string | null;
		officeHours: string | null;
		image?: string | null;
	} = $props();
</script>

<section class="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8" aria-labelledby="cta-title">
	<div class="bg-forest-950 relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
		{#if image}
			<img src={image} alt="" loading="lazy" class="absolute inset-0 -z-10 size-full object-cover opacity-35" data-speed="0.9" />
		{/if}
		<div class="from-forest-950 via-forest-950/90 absolute inset-0 -z-10 bg-linear-to-r to-forest-950/50"></div>
		<div class="bg-gold-500/20 pointer-events-none absolute -bottom-32 -left-24 -z-10 size-96 rounded-full blur-3xl"></div>

		<div class="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]" {@attach reveal({ selector: '[data-reveal]', stagger: 0.1 })}>
			<div>
				<p data-reveal class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Start planning</p>
				<h2 id="cta-title" data-reveal class="font-heading text-cream mt-4 text-3xl leading-tight font-bold text-balance sm:text-5xl">
					Tell us where you dream of going
				</h2>
				<p data-reveal class="text-cream/75 mt-5 max-w-xl text-lg">
					Share your dates and ideas and we'll put together a trip for you. Most travellers hear back within one working day.
				</p>
				<div data-reveal class="mt-8 flex flex-wrap gap-3">
					<a
						href="/contact"
						class="bg-cream text-forest-900 hover:bg-gold-300 focus-visible:ring-gold-400/60 inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none"
					>
						Plan my trip <ArrowRightIcon class="size-4" />
					</a>
					<WhatsAppButton number={whatsappNumber} size="lg" label="Chat on WhatsApp" />
				</div>
			</div>

			{#if address || email || officeHours}
				<ul data-reveal class="text-cream/80 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-7 text-sm backdrop-blur">
					{#if address}
						<li class="flex gap-3"><MapPinIcon class="text-gold-400 mt-0.5 size-5 shrink-0" /><span class="whitespace-pre-line">{address}</span></li>
					{/if}
					{#if email}
						<li class="flex gap-3"><MailIcon class="text-gold-400 mt-0.5 size-5 shrink-0" /><a href="mailto:{email}" class="hover:text-gold-300 break-all">{email}</a></li>
					{/if}
					{#if officeHours}
						<li class="flex gap-3"><ClockIcon class="text-gold-400 mt-0.5 size-5 shrink-0" /><span>{officeHours}</span></li>
					{/if}
				</ul>
			{/if}
		</div>
	</div>
</section>

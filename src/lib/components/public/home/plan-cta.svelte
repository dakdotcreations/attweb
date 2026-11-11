<!-- Closing call to action on inner pages: a dark band (leads into the footer) with the ask and the office. -->
<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import Postmark from '../postmark.svelte';
	import { reveal } from '../reveal.js';
	import { TRUST_BADGES } from '../site.js';
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

<section class="bg-forest-900 text-paper relative isolate overflow-hidden py-20 sm:py-28" aria-labelledby="cta-title">
	{#if image}
		<img src={image} alt="" loading="lazy" class="absolute inset-0 -z-10 size-full object-cover opacity-30" />
		<div class="from-forest-900 via-forest-900/85 to-forest-900/40 absolute inset-0 -z-10 bg-linear-to-r"></div>
	{/if}
	<div class="mx-auto grid max-w-7xl grid-cols-1 items-end gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8" {@attach reveal({ selector: '[data-reveal]', stagger: 0.1 })}>
		<div class="lg:col-span-7">
			<span data-reveal class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 id="cta-title" data-reveal class="font-display mt-5 text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-7xl">
				Tell us where you're going
			</h2>
			<p data-reveal class="text-paper/80 mt-6 max-w-xl text-lg leading-relaxed">
				Share your dates and ideas and we'll put together a trip for you. No payment is needed to ask.
			</p>
			<div data-reveal class="mt-8 flex flex-wrap gap-3">
				<a
					href="/contact"
					class="bg-paper text-forest-900 hover:bg-gold-300 focus-visible:ring-gold-400/60 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none"
				>
					Plan my trip <ArrowRightIcon class="size-4" />
				</a>
				<WhatsAppButton number={whatsappNumber} size="lg" label="Chat on WhatsApp" />
			</div>
		</div>

		{#if address || email || officeHours}
			<div data-reveal class="border-paper/15 flex items-start gap-6 border-t pt-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
				<Postmark place="KAMPALA ROAD" line="UGANDA" class="text-gold-300/80 w-24 shrink-0" waves={false} />
				<dl class="text-paper/80 grid gap-3 text-sm">
					{#if address}<div><dt class="sr-only">Office</dt><dd class="whitespace-pre-line">{address}</dd></div>{/if}
					{#if officeHours}<div><dt class="sr-only">Hours</dt><dd>{officeHours}</dd></div>{/if}
					{#if email}<div><dt class="sr-only">Email</dt><dd><a href="mailto:{email}" class="hover:text-gold-300 break-all">{email}</a></dd></div>{/if}
					{#each TRUST_BADGES as badge (badge)}
						<div class="flex items-center gap-2"><dt class="sr-only">Membership</dt><ShieldCheckIcon class="text-gold-300 size-4 shrink-0" /><dd>{badge}</dd></div>
					{/each}
				</dl>
			</div>
		{/if}
	</div>
</section>

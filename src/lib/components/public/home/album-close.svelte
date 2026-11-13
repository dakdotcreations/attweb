<!--
	Homepage close: the ask (plan my trip / WhatsApp), the Kampala Road office under its postmark,
	and a strip from the gallery album as proof of real trips.
-->
<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import Postmark from '../postmark.svelte';
	import { reveal } from '../reveal.js';
	import { TRUST_BADGES } from '../site.js';
	import WhatsAppButton from '../whatsapp-button.svelte';

	type Photo = { id: string; thumbUrl: string; alt: string; width: number | null; height: number | null };

	let {
		photos,
		whatsappNumber,
		email,
		address,
		officeHours
	}: {
		photos: Photo[];
		whatsappNumber: string | null;
		email: string | null;
		address: string | null;
		officeHours: string | null;
	} = $props();

	const ratio = (p: Photo) => (p.width && p.height ? p.width / p.height : 4 / 3);
</script>

<section class="bg-paper-200 text-forest-950 relative overflow-hidden py-20 sm:py-28" aria-labelledby="close-title">
	<div class="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
		<div class="lg:col-span-6" {@attach reveal({ selector: '[data-reveal]', stagger: 0.08 })}>
			<h2 id="close-title" data-reveal class="font-display text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-7xl">Tell us where you're going</h2>
			<p data-reveal class="text-ink/75 mt-6 max-w-lg text-lg leading-relaxed">
				Send your dates and who's travelling. Someone from our office replies with options and prices. No payment is needed to ask.
			</p>
			<div data-reveal class="mt-8 flex flex-wrap gap-3">
				<a
					href="/contact"
					class="bg-forest-900 text-paper hover:bg-forest-700 focus-visible:ring-gold-400/70 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none"
				>
					Plan my trip <ArrowRightIcon class="size-4" />
				</a>
				<WhatsAppButton number={whatsappNumber} size="lg" class="py-3" />
			</div>

			<div data-reveal class="border-forest-950/15 mt-14 flex items-start gap-6 border-t pt-8">
				<Postmark place="KAMPALA ROAD" line="UGANDA" class="text-forest-700/70 w-24 shrink-0" waves={false} />
				<dl class="text-ink/75 grid gap-3 text-sm">
					{#if address}<div><dt class="sr-only">Office</dt><dd class="whitespace-pre-line">{address}</dd></div>{/if}
					{#if officeHours}<div><dt class="sr-only">Hours</dt><dd>{officeHours}</dd></div>{/if}
					{#if email}<div><dt class="sr-only">Email</dt><dd><a href="mailto:{email}" class="hover:text-forest-700 break-all underline-offset-4 hover:underline">{email}</a></dd></div>{/if}
					{#each TRUST_BADGES as badge (badge)}
						<div class="flex items-center gap-2"><dt class="sr-only">Membership</dt><ShieldCheckIcon class="text-forest-700 size-4 shrink-0" /><dd>{badge}</dd></div>
					{/each}
				</dl>
			</div>
		</div>

		{#if photos.length}
			<div class="lg:col-span-6" {@attach reveal({ y: 24 })}>
				<a href="/gallery" class="group focus-visible:outline-gold-400 block focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="Open the photo gallery">
					<ul class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-0.5 sm:gap-1">
						{#each photos as photo (photo.id)}
							{@const r = ratio(photo)}
							<li style="aspect-ratio: {r};" class="bg-forest-900 min-w-0 overflow-hidden">
								<img src={photo.thumbUrl} alt={photo.alt} loading="lazy" decoding="async" class="size-full object-cover" />
							</li>
						{/each}
						<li aria-hidden="true" class="h-0 grow-[20]"></li>
					</ul>
					<span class="text-forest-800 group-hover:text-forest-600 mt-5 inline-flex items-center gap-2 text-sm font-bold">
						See the album <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
					</span>
				</a>
			</div>
		{/if}
	</div>
</section>

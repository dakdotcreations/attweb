<!-- Reasons to book with Altura. Deliberately no invented statistics. -->
<script lang="ts">
	import CompassIcon from '@lucide/svelte/icons/compass';
	import MapPinnedIcon from '@lucide/svelte/icons/map-pinned';
	import MessagesSquareIcon from '@lucide/svelte/icons/messages-square';
	import TicketCheckIcon from '@lucide/svelte/icons/ticket-check';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';
	import { TRUST_BADGES } from '../site.js';

	const reasons = [
		{
			Icon: MapPinnedIcon,
			title: 'Local experts in Kampala',
			text: 'A Ugandan team with an office on Kampala Road. We know the parks, the lodges and the roads in between.'
		},
		{
			Icon: CompassIcon,
			title: 'Trips planned around you',
			text: 'Your dates, your budget, your pace. Every package can be tailored, from solo trekkers to school groups.'
		},
		{
			Icon: MessagesSquareIcon,
			title: 'Real people on WhatsApp',
			text: 'Talk to us before you book and while you travel. Quick answers, no call centres.'
		},
		{
			Icon: TicketCheckIcon,
			title: 'Everything in one place',
			text: 'Gorilla permits, flights, hotels, visas and transfers arranged together, so nothing falls through the cracks.'
		}
	];
</script>

<section class="bg-forest-900 text-cream relative isolate overflow-hidden py-20 sm:py-28" aria-labelledby="why-title">
	<!-- Soft gold glow, echoing the logo's sun. -->
	<div class="bg-gold-500/15 pointer-events-none absolute -top-40 -right-40 -z-10 size-[36rem] rounded-full blur-3xl"></div>
	<div class="gold-rule absolute inset-x-0 top-0"></div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<SectionHeading
			id="why-title"
			tone="light"
			eyebrow="Why travel with Altura"
			title="Your journey, our passion"
			intro="We plan every trip as if we were taking it ourselves. Carefully, honestly, and with the people of Uganda at heart."
		/>

		<ul class="mt-14 grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-4" {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
			{#each reasons as { Icon, title, text } (title)}
				<li class="bg-forest-900 p-8">
					<span class="gold-border text-gold-400 flex size-14 items-center justify-center rounded-2xl">
						<Icon class="size-6" />
					</span>
					<h3 class="mt-6 text-lg font-extrabold">{title}</h3>
					<p class="text-cream/70 mt-2 text-sm leading-relaxed">{text}</p>
				</li>
			{/each}
		</ul>

		<p class="text-cream/60 mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-center text-xs font-semibold tracking-[0.2em] uppercase">
			{#each TRUST_BADGES as badge (badge)}<span>✦ {badge}</span>{/each}
		</p>
	</div>
</section>

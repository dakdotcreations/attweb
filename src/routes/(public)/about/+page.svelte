<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import { AIRLINES, BROCHURE_SERVICES, IMPACT, MISSION, OBJECTIVES, TEAM, VISION } from '#lib/components/public/about-content.js';
	import { whatsappLink } from '#lib/inquiries.js';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import Logo from '#lib/components/public/logo.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { TRUST_BADGES } from '#lib/components/public/site.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const two = (n: number) => String(n).padStart(2, '0');
</script>

<Seo
	site={data.site}
	title="About us | {data.site.companyName}"
	description="{data.site.companyName} is a Kampala-based tours and travel company. {VISION}"
/>

<!-- Intro (light): the full crest belongs on a light ground. -->
<section class="bg-paper">
	<div class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-24">
		<div {@attach reveal({ selector: '[data-reveal]', stagger: 0.08, start: 'top 95%' })}>
			<nav data-reveal aria-label="Breadcrumb" class="text-ink/55 text-xs font-semibold">
				<a href="/" class="hover:text-forest-700">Home</a> <span aria-hidden="true">/</span> About
			</nav>
			<span data-reveal class="bg-gold-500 mt-8 block h-0.5 w-10" aria-hidden="true"></span>
			<h1 data-reveal class="font-display text-forest-950 mt-5 text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-7xl">
				Your journey, our passion
			</h1>
			<p data-reveal class="text-ink/75 mt-6 max-w-xl text-lg leading-relaxed">
				Altura Tours &amp; Travel Limited is a Ugandan tours and travel company based on Kampala Road. We plan gorilla
				and chimpanzee treks, wildlife safaris and tailor-made holidays, and we take care of the details that make travel
				easy: flights, visas, transfers and more.
			</p>
			<ul data-reveal class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				{#each TRUST_BADGES as badge (badge)}
					<li class="text-forest-900 flex items-center gap-2 text-sm font-semibold">
						<ShieldCheckIcon class="text-forest-700 size-5" />
						{badge}
					</li>
				{/each}
			</ul>
		</div>
		<div class="flex justify-center" {@attach reveal({ y: 24 })}>
			<div class="h-64 sm:h-80"><Logo variant="full" /></div>
		</div>
	</div>
</section>

<!-- Issued by (dark): the people behind every trip. Hidden until TEAM is filled in. -->
{#if TEAM.length}
	<section class="bg-forest-900 text-paper py-20 sm:py-28" aria-labelledby="team-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 id="team-title" class="font-display mt-5 text-5xl leading-[0.95] font-semibold uppercase sm:text-6xl" {@attach reveal()}>Issued by</h2>
			<p class="text-paper/75 mt-5 max-w-xl text-lg">The people in our Kampala Road office who plan your trip and answer your messages.</p>
			<ul class="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4" {@attach reveal({ selector: ':scope > li', stagger: 0.08 })}>
				{#each TEAM as person (person.name)}
					{@const wa = whatsappLink(person.whatsapp ?? data.site.whatsappNumber, `Hello ${person.name}, I'd like help planning a trip.`)}
					<li>
						<img src={person.photo} alt="{person.name}, {person.role}" loading="lazy" class="perforated-left aspect-[4/5] w-full rounded-md object-cover" />
						<p class="font-display mt-4 text-2xl leading-none font-semibold uppercase">{person.name}</p>
						<p class="text-paper/65 mt-1 text-sm">{person.role}</p>
						{#if wa}
							<a href={wa} target="_blank" rel="noopener noreferrer" class="text-gold-300 hover:text-gold-100 mt-3 inline-block text-sm font-bold underline-offset-4 hover:underline">
								Message {person.name} on WhatsApp
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<!-- Vision & mission (light, editorial) -->
<section class="bg-paper-200" aria-label="Vision and mission">
	<div class="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28" {@attach reveal({ selector: ':scope > article', stagger: 0.12 })}>
		<article>
			<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 class="font-display text-forest-950 mt-5 text-4xl font-semibold uppercase sm:text-5xl">Our vision</h2>
			<p class="text-ink/80 mt-5 text-lg leading-relaxed">{VISION}</p>
		</article>
		<article>
			<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 class="font-display text-forest-950 mt-5 text-4xl font-semibold uppercase sm:text-5xl">Our mission</h2>
			<p class="text-ink/80 mt-5 text-lg leading-relaxed">{MISSION}</p>
		</article>
	</div>
</section>

<!-- Objectives (dark): a numbered list, not icon tiles. -->
<section class="bg-forest-950 text-paper py-20 sm:py-28" aria-labelledby="objectives-title">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div {@attach reveal()}>
			<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 id="objectives-title" class="font-display mt-5 text-5xl leading-[0.95] font-semibold uppercase sm:text-6xl">What guides us</h2>
		</div>
		<ol class="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.05, y: 20 })}>
			{#each OBJECTIVES as objective, i (objective.title)}
				<li class="border-paper/15 border-t pt-5">
					<span class="font-display text-gold-300 text-3xl leading-none font-semibold tabular-nums">{two(i + 1)}</span>
					<h3 class="font-display mt-4 text-2xl leading-tight font-semibold uppercase">{objective.title}</h3>
					<p class="text-paper/70 mt-2 leading-relaxed">{objective.text}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<!-- What we do + impact (light) -->
<section class="bg-paper">
	<div class="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
		<div {@attach reveal()}>
			<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 class="font-display text-forest-950 mt-5 text-4xl font-semibold uppercase sm:text-5xl">Our services</h2>
			<ul class="mt-8 grid gap-3 sm:grid-cols-2">
				{#each BROCHURE_SERVICES as service (service)}
					<li class="text-ink/85 flex items-start gap-3 text-base font-semibold">
						<CheckIcon class="text-forest-700 mt-0.5 size-5 shrink-0" />
						{service}
					</li>
				{/each}
			</ul>
			<a
				href="/services"
				class="border-forest-950/30 text-forest-950 hover:bg-forest-950 hover:text-paper mt-10 inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors"
			>
				Explore our services <ArrowRightIcon class="size-4" />
			</a>
		</div>
		<div {@attach reveal({ delay: 0.1 })}>
			<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
			<h2 class="font-display text-forest-950 mt-5 text-4xl font-semibold uppercase sm:text-5xl">Why it matters</h2>
			<p class="text-ink/70 mt-4">Every trip you take with us does more than move you from place to place. It:</p>
			<ul class="mt-6">
				{#each IMPACT as item (item)}
					<li class="border-forest-950/10 text-ink/85 flex items-start gap-3 border-t py-3 text-base">
						<CheckIcon class="text-forest-700 mt-0.5 size-5 shrink-0" />{item}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<!-- Airlines (light alt) -->
<section class="bg-paper-200 py-14" aria-labelledby="airlines-title">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
		<h2 id="airlines-title" class="font-display text-forest-950 inline-flex items-center gap-2 text-2xl font-semibold uppercase">
			<PlaneIcon class="text-forest-700 size-5" /> Flights we book
		</h2>
		<ul class="mt-6 flex flex-wrap justify-center gap-2" {@attach reveal({ selector: ':scope > li', stagger: 0.03, y: 12 })}>
			{#each AIRLINES as airline (airline)}
				<li class="bg-paper text-forest-900 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-forest-950/10">{airline}</li>
			{/each}
		</ul>
	</div>
</section>

<PlanCta
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
	image={data.site.ogImageUrl}
/>

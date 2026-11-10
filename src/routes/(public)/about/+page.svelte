<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import { AIRLINES, BROCHURE_SERVICES, IMPACT, MISSION, OBJECTIVES, VISION } from '#lib/components/public/about-content.js';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import Logo from '#lib/components/public/logo.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { TRUST_BADGES } from '#lib/components/public/site.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import AwardIcon from '@lucide/svelte/icons/award';
	import CheckIcon from '@lucide/svelte/icons/check';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import GemIcon from '@lucide/svelte/icons/gem';
	import HandshakeIcon from '@lucide/svelte/icons/handshake';
	import HeartHandshakeIcon from '@lucide/svelte/icons/heart-handshake';
	import LeafIcon from '@lucide/svelte/icons/leaf';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import MountainIcon from '@lucide/svelte/icons/mountain';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import TargetIcon from '@lucide/svelte/icons/target';
	import UsersIcon from '@lucide/svelte/icons/users';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const icons = {
		mountain: MountainIcon,
		gem: GemIcon,
		'heart-handshake': HeartHandshakeIcon,
		wallet: WalletIcon,
		'shield-check': ShieldCheckIcon,
		handshake: HandshakeIcon,
		users: UsersIcon,
		leaf: LeafIcon,
		lightbulb: LightbulbIcon
	};
</script>

<Seo
	site={data.site}
	title="About us | {data.site.companyName}"
	description="{data.site.companyName} is a Kampala-based tours and travel company. {VISION}"
/>

<!-- Intro: the full crest belongs on a light background. -->
<section class="bg-cream relative overflow-hidden">
	<div class="bg-gold-300/30 pointer-events-none absolute -top-40 -right-40 size-[34rem] rounded-full blur-3xl"></div>
	<div class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-24">
		<div {@attach reveal({ selector: '[data-reveal]', stagger: 0.08, start: 'top 95%' })}>
			<nav data-reveal aria-label="Breadcrumb" class="text-ink/55 text-xs font-semibold">
				<a href="/" class="hover:text-forest-700">Home</a> <span aria-hidden="true">/</span> About
			</nav>
			<p data-reveal class="text-gold-600 mt-6 text-xs font-bold tracking-[0.3em] uppercase">About Altura</p>
			<h1 data-reveal class="font-heading text-forest-900 mt-4 text-4xl leading-tight font-bold text-balance sm:text-6xl">
				Your journey, our passion
			</h1>
			<p data-reveal class="text-ink/75 mt-6 max-w-xl text-lg leading-relaxed">
				Altura Tours &amp; Travel Limited is a Ugandan tours and travel company based on Kampala Road. We plan gorilla
				and chimpanzee treks, wildlife safaris and tailor-made holidays, and we take care of the details that make travel
				easy: flights, visas, transfers and more.
			</p>
			<ul data-reveal class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				{#each TRUST_BADGES as badge, i (badge)}
					<li class="gold-border text-forest-900 flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-sm font-semibold" style="--gold-border-fill: var(--color-cream)">
						<span class="bg-forest-800 text-gold-400 flex size-8 items-center justify-center rounded-full">
							{#if i === 0}<AwardIcon class="size-4" />{:else}<ShieldCheckIcon class="size-4" />{/if}
						</span>
						{badge}
					</li>
				{/each}
			</ul>
		</div>
		<div class="flex justify-center" {@attach reveal({ y: 24 })}>
			<div class="h-64 sm:h-80"><Logo variant="full" /></div>
		</div>
	</div>
	<div class="gold-rule absolute inset-x-0 bottom-0"></div>
</section>

<!-- Vision & mission -->
<section class="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28" aria-label="Vision and mission" {@attach reveal({ selector: ':scope > article', stagger: 0.12 })}>
	<article class="bg-forest-900 text-cream relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
		<div class="bg-gold-500/20 pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full blur-3xl"></div>
		<span class="gold-border text-gold-400 relative flex size-14 items-center justify-center rounded-2xl"><EyeIcon class="size-6" /></span>
		<h2 class="font-heading relative mt-6 text-3xl font-bold">Our vision</h2>
		<p class="text-cream/85 relative mt-4 text-lg leading-relaxed">{VISION}</p>
	</article>
	<article class="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-black/5 sm:p-12">
		<span class="bg-forest-800 text-gold-400 flex size-14 items-center justify-center rounded-2xl"><TargetIcon class="size-6" /></span>
		<h2 class="font-heading text-forest-900 mt-6 text-3xl font-bold">Our mission</h2>
		<p class="text-ink/80 mt-4 text-lg leading-relaxed">{MISSION}</p>
	</article>
</section>

<!-- Objectives -->
<section class="bg-cream-200/60 py-20 sm:py-28" aria-labelledby="objectives-title">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="max-w-2xl" {@attach reveal({ selector: '[data-reveal]', stagger: 0.08 })}>
			<p data-reveal class="text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">What guides us</p>
			<h2 id="objectives-title" data-reveal class="font-heading text-forest-900 mt-4 text-3xl font-bold sm:text-4xl">Our objectives</h2>
		</div>
		<ul class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.06, y: 24 })}>
			{#each OBJECTIVES as objective (objective.title)}
				{@const Icon = icons[objective.icon]}
				<li class="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
					<span class="bg-forest-800 text-gold-400 ring-gold-500/30 flex size-12 items-center justify-center rounded-full ring-4">
						<Icon class="size-5" />
					</span>
					<h3 class="text-forest-950 mt-5 text-lg font-extrabold">{objective.title}</h3>
					<p class="text-ink/70 mt-2 text-sm leading-relaxed">{objective.text}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- What we do + impact -->
<section class="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
	<div {@attach reveal()}>
		<p class="text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">What we do</p>
		<h2 class="font-heading text-forest-900 mt-4 text-3xl font-bold sm:text-4xl">Our services</h2>
		<ul class="mt-8 grid gap-3 sm:grid-cols-2">
			{#each BROCHURE_SERVICES as service (service)}
				<li class="flex items-start gap-3 text-[0.95rem] font-semibold">
					<span class="bg-forest-800 text-gold-400 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"><CheckIcon class="size-3" /></span>
					{service}
				</li>
			{/each}
		</ul>
		<a href="/services" class="text-forest-800 hover:text-forest-600 mt-8 inline-flex items-center gap-2 text-sm font-bold">
			Explore our services <ArrowRightIcon class="size-4" />
		</a>
	</div>
	<div class="bg-forest-900 text-cream rounded-[2rem] p-8 sm:p-10" {@attach reveal({ delay: 0.1 })}>
		<p class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Why it matters</p>
		<h2 class="font-heading mt-4 text-2xl font-bold sm:text-3xl">Choose Altura Tours and Travel</h2>
		<p class="text-cream/70 mt-3 text-sm">Every trip you take with us does more than move you from place to place. It:</p>
		<ul class="mt-6 space-y-3">
			{#each IMPACT as item (item)}
				<li class="flex items-start gap-3 text-[0.95rem]">
					<CheckIcon class="text-gold-400 mt-0.5 size-5 shrink-0" />{item}
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Airlines -->
<section class="border-gold-500/20 border-y bg-white py-14" aria-labelledby="airlines-title">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
		<h2 id="airlines-title" class="text-forest-900 inline-flex items-center gap-2 text-sm font-extrabold tracking-[0.2em] uppercase">
			<PlaneIcon class="text-gold-600 size-4" /> Flights we book
		</h2>
		<ul class="mt-6 flex flex-wrap justify-center gap-2" {@attach reveal({ selector: ':scope > li', stagger: 0.03, y: 12 })}>
			{#each AIRLINES as airline (airline)}
				<li class="bg-cream text-forest-900 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/5">{airline}</li>
			{/each}
		</ul>
	</div>
</section>

<div class="bg-cream pt-20 sm:pt-28">
	<PlanCta
		whatsappNumber={data.site.whatsappNumber}
		email={data.site.email}
		address={data.site.address}
		officeHours={data.site.officeHours}
		image={data.site.ogImageUrl}
	/>
</div>

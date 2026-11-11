<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import PackageCard from '#lib/components/public/package-card.svelte';
	import PageHero from '#lib/components/public/page-hero.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { cn } from '#lib/utils.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const active = $derived(data.services.find((s) => s.slug === data.activeService) ?? null);
	const title = $derived(active ? `${active.name} tours` : 'Tours & journeys');
</script>

<Seo
	site={data.site}
	title="{title} | {data.site.companyName}"
	description={active
		? `${active.name} packages from ${data.site.companyName}: prices, highlights and what's included.`
		: `Gorilla trekking, safaris and holidays from ${data.site.companyName}, with prices, highlights and what's included.`}
	path={active ? `/tours?service=${active.slug}` : '/tours'}
	image={data.packages.find((p) => p.coverImage)?.coverImage?.url}
/>

<PageHero
	{title}
	image={data.packages.find((p) => p.coverImage)?.coverImage?.url ?? null}
	intro="Every journey can be tailored to your dates, group and budget. Pick one as a starting point and we'll shape it around you."
	breadcrumbs={[{ label: 'Tours', href: '/tours' }]}
>
	{#if data.services.length}
		<nav aria-label="Filter by service" class="-mx-2 mt-8 flex max-w-full gap-1 overflow-x-auto [scrollbar-width:thin]">
			{#each [{ slug: '', name: 'All tours' }, ...data.services] as s (s.slug)}
				{@const isActive = data.activeService === s.slug}
				<a
					href={s.slug ? `/tours?service=${s.slug}` : '/tours'}
					data-sveltekit-reset="false"
					aria-current={isActive ? 'page' : undefined}
					class={cn(
						'shrink-0 px-2 py-2 text-sm font-semibold whitespace-nowrap underline-offset-[10px] transition-colors',
						isActive ? 'text-paper decoration-gold-400 underline decoration-2' : 'text-paper/70 hover:text-paper'
					)}
				>
					{s.name}
				</a>
			{/each}
		</nav>
	{/if}
</PageHero>

<section>
<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
	{#if data.packages.length}
		<p class="text-ink/60 mb-8 text-sm font-semibold">
			{data.packages.length} {data.packages.length === 1 ? 'journey' : 'journeys'}
		</p>
		{#key data.activeService}
			<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.08, start: 'top 95%' })}>
				{#each data.packages as pkg (pkg.id)}
					<li><PackageCard {pkg} currency={data.currency} /></li>
				{/each}
			</ul>
		{/key}
	{:else}
		<div class="mx-auto max-w-lg py-10 text-center">
			<h2 class="font-display text-forest-950 text-3xl font-semibold uppercase">No tours here yet</h2>
			<p class="text-ink/70 mt-3">
				{active ? `We don't have a ready-made ${active.name} package online yet, but we can plan one for you.` : 'New journeys are on their way.'}
			</p>
			<a href={active ? `/contact?service=${active.slug}` : '/contact'} class="bg-forest-900 text-paper hover:bg-forest-700 mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">
				Plan a custom trip
			</a>
		</div>
	{/if}
</div>
</section>

<PlanCta
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
	image={data.packages.find((p) => p.coverImage)?.coverImage?.url ?? null}
/>

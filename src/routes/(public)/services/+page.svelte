<script lang="ts">
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import PageHero from '#lib/components/public/page-hero.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import ServiceCard from '#lib/components/public/service-card.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Our services | {data.site.companyName}</title>
	<meta
		name="description"
		content="Gorilla trekking, wildlife safaris, holidays, flights, visas, medical tourism, study abroad and school tours, all arranged by {data.site.companyName} in Kampala."
	/>
</svelte:head>

<PageHero
	eyebrow="Our services"
	title="Everything your journey needs"
	intro="From gorilla permits and safaris to flights, visas and study abroad, one Kampala team takes care of it all."
	breadcrumbs={[{ label: 'Services', href: '/services' }]}
/>

<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
	{#if data.allServices.length}
		<ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.08 })}>
			{#each data.allServices as service (service.id)}
				<li><ServiceCard {service} /></li>
			{/each}
		</ul>
	{:else}
		<p class="text-ink/60 text-center">Our services are being updated. Please contact us to plan your trip.</p>
	{/if}
</section>

<PlanCta
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
	image={data.allServices.find((s) => s.coverImage?.url)?.coverImage?.url ?? null}
/>

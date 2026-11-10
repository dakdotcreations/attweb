<script lang="ts">
	import type { Currency } from '#lib/format.js';
	import type { ComponentProps } from 'svelte';
	import PackageCard from '../package-card.svelte';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';

	let {
		packages,
		currency
	}: { packages: ComponentProps<typeof PackageCard>['pkg'][]; currency: Currency } = $props();
</script>

{#if packages.length}
	<section class="bg-cream py-20 sm:py-28" aria-labelledby="journeys-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<SectionHeading
				id="journeys-title"
				eyebrow="Popular journeys"
				title="Trips our travellers love"
				intro="Hand-picked journeys with transport, permits and stays arranged. Every trip can be tailored to your dates and budget."
				link={{ href: '/tours', label: 'View all tours' }}
			/>
			<ul class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.12 })}>
				{#each packages as pkg (pkg.slug)}
					<li><PackageCard {pkg} {currency} /></li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

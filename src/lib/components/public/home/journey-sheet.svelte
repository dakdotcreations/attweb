<!--
	Homepage: journeys from Kampala. Published packages as photo cards with ticket stubs, the lead
	journey large. The composition follows the count, so one or two journeys still fill the row.
-->
<script lang="ts">
	import type { Currency } from '#lib/format.js';
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import type { ComponentProps } from 'svelte';
	import PackageCard from '../package-card.svelte';
	import { reveal } from '../reveal.js';

	let { packages, currency }: { packages: (ComponentProps<typeof PackageCard>['pkg'] & { id: string })[]; currency: Currency } = $props();

	const count = $derived(packages.length);
	/** The lead card is large whenever it isn't one of a pair. */
	const leadWide = (i: number) => i === 0 && count !== 2;
</script>

{#if count}
	<section class="bg-paper text-forest-950 py-20 sm:py-28" aria-labelledby="journeys-title">
		<div class="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
			<div class={cn(count === 1 ? 'lg:col-span-5' : 'lg:col-span-4', 'lg:pt-4')} {@attach reveal()}>
				<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
				<h2 id="journeys-title" class="font-display mt-5 text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-6xl">Journeys from Kampala</h2>
				<p class="text-ink/70 mt-5 max-w-sm text-lg leading-relaxed">
					Each one is a starting point. Tell us your dates, group and budget, and we shape it around you.
				</p>
				<a
					href="/tours"
					class="border-forest-950/30 hover:bg-forest-950 hover:text-paper mt-8 inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors"
				>
					All journeys <ArrowRightIcon class="size-4" />
				</a>
			</div>

			<ul class={cn('grid grid-cols-1 gap-5 sm:gap-6', count > 1 && 'sm:grid-cols-2', count === 1 ? 'lg:col-span-7' : 'lg:col-span-8')} {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
				{#each packages as pkg, i (pkg.id)}
					<li class={cn(leadWide(i) && count > 1 && 'sm:col-span-2')}>
						<PackageCard {pkg} {currency} size={leadWide(i) ? 'lg' : 'md'} eager={i === 0} />
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

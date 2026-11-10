<!--
	The first two services (by dashboard order, so safaris lead) as large editorial panels,
	then every other service as an icon tile, echoing the flyers' round icon badges.
-->
<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';
	import { serviceIcon } from '../service-icons.js';

	type Service = {
		id: string;
		name: string;
		slug: string;
		summary: string;
		coverImage: { url?: string; thumbUrl: string; alt: string } | null;
	};

	let { services }: { services: Service[] } = $props();

	const signature = $derived(services.slice(0, 2));
	const others = $derived(services.slice(2));
</script>

{#if services.length}
	<section class="bg-cream-200/60 py-20 sm:py-28" aria-labelledby="experiences-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<SectionHeading
				id="experiences-title"
				eyebrow="Signature experiences"
				title="Uganda, the Pearl of Africa, up close"
				intro="From misty mountain forests to golden savannah, our local guides take you to the encounters people travel across the world for."
			/>

			<ul class="mt-12 grid gap-6 lg:grid-cols-2" {@attach reveal({ selector: ':scope > li', stagger: 0.15 })}>
				{#each signature as service (service.id)}
					{@const Icon = serviceIcon(service.slug, service.name)}
					<li>
						<a
							href="/services/{service.slug}"
							class="group focus-visible:ring-gold-500 relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] p-8 focus-visible:ring-4 focus-visible:outline-none sm:aspect-[5/4] sm:p-10 lg:aspect-[4/5] xl:aspect-[5/6]"
						>
							{#if service.coverImage?.url}
								<!-- Taller than the panel so ScrollSmoother's parallax never shows an edge. -->
								<img
									src={service.coverImage.url}
									alt={service.coverImage.alt}
									loading="lazy"
									decoding="async"
									data-speed="auto"
									class="absolute inset-x-0 -top-[10%] -z-10 h-[120%] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
								/>
							{:else}
								<div class="from-forest-700 to-forest-950 absolute inset-0 -z-10 bg-linear-to-br"></div>
							{/if}
							<div class="from-forest-950/95 via-forest-950/40 absolute inset-0 -z-10 bg-linear-to-t to-transparent"></div>

							<span class="bg-cream/15 text-gold-300 ring-gold-400/40 mb-auto flex size-12 items-center justify-center rounded-full ring-1 backdrop-blur">
								<Icon class="size-6" />
							</span>
							<h3 class="font-heading text-cream text-3xl leading-tight font-bold sm:text-4xl">{service.name}</h3>
							{#if service.summary}
								<p class="text-cream/80 mt-3 max-w-md text-base">{service.summary}</p>
							{/if}
							<span class="text-gold-300 mt-6 inline-flex items-center gap-2 text-sm font-bold">
								Explore {service.name.toLowerCase()}
								<ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
							</span>
						</a>
					</li>
				{/each}
			</ul>

			{#if others.length}
				<div class="mt-20">
					<h3 class="font-heading text-forest-900 text-center text-2xl font-bold">More ways we help you travel</h3>
					<div class="gold-rule mx-auto mt-4 w-40"></div>
					<ul class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" {@attach reveal({ selector: ':scope > li', stagger: 0.06, y: 24 })}>
						{#each others as service (service.id)}
							{@const Icon = serviceIcon(service.slug, service.name)}
							<li>
								<a
									href="/services/{service.slug}"
									class="group hover:border-gold-500/60 focus-visible:ring-gold-500 flex h-full flex-col items-center rounded-3xl border border-transparent bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:outline-none"
								>
									<span class="bg-forest-800 text-gold-400 ring-gold-500/40 group-hover:bg-gold-500 group-hover:text-forest-950 flex size-16 items-center justify-center rounded-full ring-4 transition-colors">
										<Icon class="size-7" />
									</span>
									<span class="text-forest-950 mt-4 text-sm font-extrabold sm:text-base">{service.name}</span>
									{#if service.summary}
										<span class="text-ink/60 mt-1.5 line-clamp-2 text-xs sm:text-sm">{service.summary}</span>
									{/if}
									<ArrowUpRightIcon class="text-gold-600 mt-3 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</section>
{/if}

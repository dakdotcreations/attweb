<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import Lightbox from '#lib/components/public/lightbox.svelte';
	import PageHero from '#lib/components/public/page-hero.svelte';
	import Pagination from '#lib/components/public/pagination.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { cn } from '#lib/utils.js';
	import ExpandIcon from '@lucide/svelte/icons/expand';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let lightbox = $state<ReturnType<typeof Lightbox>>();
	const title = $derived(data.activeCategory ? `${data.activeCategory} gallery` : 'Gallery');

	function href(params: { category?: string; page?: number }) {
		const qs = new URLSearchParams();
		if (params.category) qs.set('category', params.category);
		if (params.page && params.page > 1) qs.set('page', String(params.page));
		const s = qs.toString();
		return s ? `/gallery?${s}` : '/gallery';
	}
	const pageHref = (n: number) => href({ category: data.activeCategory, page: n });
</script>

<Seo
	site={data.site}
	title="{title}{data.page > 1 ? ` (page ${data.page})` : ''} | {data.site.companyName}"
	description="Photos from {data.site.companyName} journeys: gorillas, wildlife safaris, beach holidays and travellers on the road with us."
	path={pageHref(data.page)}
	image={data.photos[0]?.url}
/>

<PageHero
	eyebrow="Gallery"
	title={data.activeCategory ? data.activeCategory : 'Moments from the road'}
	intro="Gorillas in the mist, lions on the plains, and our travellers out exploring. A glimpse of what's waiting for you."
	breadcrumbs={[{ label: 'Gallery', href: '/gallery' }]}
>
	{#if data.categories.length}
		<nav aria-label="Filter by category" class="mt-8 -mb-2 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
			{#each ['', ...data.categories] as c (c)}
				{@const isActive = data.activeCategory === c}
				<a
					href={href({ category: c })}
					data-sveltekit-noscroll
					aria-current={isActive ? 'page' : undefined}
					class={cn(
						'shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors',
						isActive ? 'bg-gold-500 text-forest-950' : 'bg-cream/10 text-cream hover:bg-cream/20 ring-1 ring-white/20'
					)}
				>
					{c || 'All photos'}
				</a>
			{/each}
		</nav>
	{/if}
</PageHero>

<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
	{#if data.photos.length}
		{#key `${data.activeCategory}-${data.page}`}
			<!-- Uniform tiles: every photo is cropped to the same 4:3 frame; the lightbox shows it uncropped. -->
			<ul class="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.04, start: 'top 95%' })}>
				{#each data.photos as photo, i (photo.id)}
					<li>
						<button
							type="button"
							class="group bg-forest-100 focus-visible:ring-gold-500 relative block aspect-4/3 w-full overflow-hidden rounded-2xl focus-visible:ring-4 focus-visible:outline-none"
							onclick={() => lightbox?.open(i)}
							aria-label="Open photo {i + 1} of {data.photos.length}{photo.alt ? `: ${photo.alt}` : ''}"
						>
							<img
								src={photo.thumbUrl}
								srcset="{photo.thumbUrl} 480w, {photo.url} {photo.width}w"
								sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
								alt={photo.alt}
								loading={i < 8 ? 'eager' : 'lazy'}
								decoding="async"
								class="size-full object-cover transition-transform duration-700 group-hover:scale-105"
							/>
							<span
								class="from-forest-950/80 text-cream pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t to-transparent p-3 pt-10 text-left text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
							>
								<span class="line-clamp-2">{photo.caption || photo.alt || photo.galleryCategory || ''}</span>
								<ExpandIcon class="size-4 shrink-0" />
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/key}

		<Pagination page={data.page} pageCount={data.pageCount} href={pageHref} prevLabel="Previous" nextLabel="More photos" />

		<Lightbox bind:this={lightbox} photos={data.photos} {title} />
	{:else}
		<div class="mx-auto max-w-lg py-10 text-center">
			<h2 class="font-heading text-forest-900 text-2xl font-bold">Photos are on their way</h2>
			<p class="text-ink/65 mt-3">We're picking our favourite shots from recent trips. In the meantime, browse our tours.</p>
			<a href="/tours" class="bg-forest-800 text-cream hover:bg-forest-700 mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">See our tours</a>
		</div>
	{/if}
</section>

<PlanCta
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
	image={data.photos[0]?.url ?? null}
/>

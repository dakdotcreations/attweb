<!--
	The gallery as Altura's stamp album: photos keep their own shape in justified rows (like
	Google Photos), edge to edge on the forest album page, grouped by month under a postmark.
	"Load more" extends the album in place (?page=n is cumulative, so links still work without JS).
-->
<script lang="ts">
	import { page } from '$app/state';
	import Lightbox from '#lib/components/public/lightbox.svelte';
	import Postmark from '#lib/components/public/postmark.svelte';
	import Seo from '#lib/components/public/seo.svelte';
	import WhatsAppButton from '#lib/components/public/whatsapp-button.svelte';
	import { cn } from '#lib/utils.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let lightbox = $state<ReturnType<typeof Lightbox>>();
	const title = $derived(data.activeCategory ? `${data.activeCategory} gallery` : 'Gallery');

	const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const postmarkFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

	/** Consecutive photos grouped by upload month; `start` is each group's index into data.photos. */
	const months = $derived.by(() => {
		const groups: { key: string; label: string; stamp: string; start: number; photos: typeof data.photos }[] = [];
		data.photos.forEach((photo, i) => {
			const date = new Date(photo.createdAt);
			const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
			let group = groups.at(-1);
			if (group?.key !== key) {
				group = { key, label: monthFormat.format(date), stamp: postmarkFormat.format(date).toUpperCase(), start: i, photos: [] };
				groups.push(group);
			}
			group.photos.push(photo);
		});
		return groups;
	});

	/** Width ÷ height, so each tile keeps the photo's real shape (4:3 when unknown). */
	const ratio = (p: { width: number | null; height: number | null }) => (p.width && p.height ? p.width / p.height : 4 / 3);

	function href(params: { category?: string; page?: number }) {
		const qs = new URLSearchParams();
		if (params.category) qs.set('category', params.category);
		if (params.page && params.page > 1) qs.set('page', String(params.page));
		const s = qs.toString();
		return s ? `/gallery?${s}` : '/gallery';
	}
</script>

<Seo
	site={data.site}
	title="{title} | {data.site.companyName}"
	description="Photos from {data.site.companyName} journeys: gorillas, wildlife safaris, beach holidays and travellers on the road with us."
	path={href({ category: data.activeCategory })}
	image={data.photos[0]?.url}
/>

<div class="bg-forest-950 text-paper min-h-[70svh]">
	<header class="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-6 px-4 pt-14 pb-8 sm:px-6 lg:px-8 lg:pt-20">
		<div>
			<h1 class="font-display text-5xl leading-[0.95] font-semibold uppercase sm:text-6xl">{data.activeCategory || 'Gallery'}</h1>
			<p class="text-paper/70 mt-3 max-w-xl">
				Photos from our journeys and our travellers, newest first.
				{#if data.total}<span class="text-paper/50 tabular-nums">{data.total} {data.total === 1 ? 'photo' : 'photos'}.</span>{/if}
			</p>
		</div>
		{#if data.categories.length}
			<nav aria-label="Filter by category" class="-mx-1 flex max-w-full gap-1 overflow-x-auto [scrollbar-width:thin]">
				{#each ['', ...data.categories] as c (c)}
					{@const isActive = data.activeCategory === c}
					<a
						href={href({ category: c })}
						aria-current={isActive ? 'page' : undefined}
						class={cn(
							'shrink-0 px-2 py-2 text-sm font-semibold whitespace-nowrap underline-offset-[10px] transition-colors',
							isActive ? 'text-paper decoration-gold-400 underline decoration-2' : 'text-paper/65 hover:text-paper'
						)}
					>
						{c || 'All photos'}
					</a>
				{/each}
			</nav>
		{/if}
	</header>

	{#if data.photos.length}
		<div class="px-0.5 pb-4 sm:px-1">
			{#each months as month (month.key)}
				<section aria-label={month.label} class="pt-6 first:pt-0">
					<h2 class="flex items-center gap-3 px-3 pb-3 sm:px-5">
						<Postmark place="ALTURA" line="KAMPALA" date={month.stamp} waves={false} class="text-gold-300/80 size-16 shrink-0" />
						<span class="font-display text-xl font-semibold tracking-wide uppercase">{month.label}</span>
					</h2>
					<!-- Justified rows: each tile grows by its aspect ratio, so every row shares one height. -->
					<ul class="flex flex-wrap gap-[3px] [--row:7.5rem] sm:[--row:11rem] lg:[--row:15rem]">
						{#each month.photos as photo, j (photo.id)}
							{@const r = ratio(photo)}
							{@const i = month.start + j}
							<li style="flex: {r} 1 calc({r} * var(--row)); aspect-ratio: {r};" class="bg-forest-900 relative max-h-[60vh] min-w-0">
								<button
									type="button"
									class="group focus-visible:outline-gold-400 block size-full overflow-hidden focus-visible:outline-3 focus-visible:-outline-offset-3"
									onclick={() => lightbox?.open(i)}
									aria-label="Open photo {i + 1} of {data.photos.length}{photo.caption || photo.alt ? `: ${photo.caption || photo.alt}` : ''}"
								>
									<img
										src={photo.thumbUrl}
										alt=""
										width={photo.width ?? undefined}
										height={photo.height ?? undefined}
										loading={i < 12 ? 'eager' : 'lazy'}
										decoding="async"
										class="size-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
									/>
								</button>
							</li>
						{/each}
						<!-- Soaks up the last row's spare width so it isn't stretched huge. -->
						<li aria-hidden="true" class="h-0 grow-[20]"></li>
					</ul>
				</section>
			{/each}
		</div>

		<footer class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 lg:px-8">
			{#if data.page < data.pageCount}
				<a
					href={href({ category: data.activeCategory, page: data.page + 1 })}
					data-sveltekit-noscroll
					data-sveltekit-keepfocus
					class="bg-paper text-forest-900 hover:bg-gold-300 focus-visible:ring-gold-400/60 rounded-full px-7 py-3.5 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none"
				>
					Load more photos
					<span class="text-forest-900/60 font-semibold tabular-nums">({data.photos.length} of {data.total})</span>
				</a>
			{/if}
			<p class="text-paper/70 max-w-md">Want to be in the next album? Tell us where you'd like to go.</p>
			<div class="flex flex-wrap justify-center gap-3">
				<a href="/contact" class="border-paper/40 hover:border-paper rounded-full border px-6 py-3 text-sm font-bold transition-colors">Plan my trip</a>
				<WhatsAppButton number={data.site.whatsappNumber} size="md" />
			</div>
		</footer>

		<Lightbox bind:this={lightbox} photos={data.photos} {title} />
	{:else}
		<div class="mx-auto max-w-lg px-4 py-20 text-center">
			<Postmark place="ALTURA" line="KAMPALA" waves={false} class="text-gold-300/70 mx-auto size-20" />
			<h2 class="font-display mt-6 text-2xl font-semibold uppercase">The album is empty for now</h2>
			<p class="text-paper/70 mt-3">We're choosing our favourite shots from recent trips. In the meantime, browse our tours.</p>
			<a href="/tours" class="bg-paper text-forest-900 hover:bg-gold-300 mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">See our tours</a>
		</div>
	{/if}
</div>

<svelte:head>
	{#if page.url.searchParams.get('page')}<meta name="robots" content="noindex, follow" />{/if}
</svelte:head>

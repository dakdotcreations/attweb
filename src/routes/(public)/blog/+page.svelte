<script lang="ts">
	import { page } from '$app/state';
	import BlogCard from '#lib/components/public/blog-card.svelte';
	import PlanCta from '#lib/components/public/home/plan-cta.svelte';
	import PageHero from '#lib/components/public/page-hero.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import { formatDate } from '#lib/format.js';
	import { cn } from '#lib/utils.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const active = $derived(data.topics.find((t) => t.slug === data.activeTopic) ?? null);
	const title = $derived(active ? `${active.name} guides` : 'Travel guides & stories');
	// The newest post gets a wide feature card on the first unfiltered page.
	const featured = $derived(!active && data.page === 1 ? (data.posts[0] ?? null) : null);
	const rest = $derived(featured ? data.posts.slice(1) : data.posts);

	function pageHref(n: number) {
		const params = new URLSearchParams();
		if (data.activeTopic) params.set('topic', data.activeTopic);
		if (n > 1) params.set('page', String(n));
		const qs = params.toString();
		return qs ? `/blog?${qs}` : '/blog';
	}
</script>

<svelte:head>
	<title>{title}{data.page > 1 ? ` (page ${data.page})` : ''} | {data.site.companyName}</title>
	<meta
		name="description"
		content={active
			? `${active.name} guides and tips from the ${data.site.companyName} team in Kampala.`
			: `Gorilla permits, safaris, visas, medical tourism and more: practical travel guides from the ${data.site.companyName} team.`}
	/>
	<link rel="canonical" href={page.url.origin + pageHref(data.page)} />
</svelte:head>

<PageHero
	eyebrow="Blog"
	{title}
	intro="Practical advice from our Kampala team: permits, seasons, visas, what to pack and what to expect."
	breadcrumbs={[{ label: 'Blog', href: '/blog' }]}
>
	{#if data.topics.length}
		<nav aria-label="Filter by topic" class="mt-8 -mb-2 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
			{#each [{ slug: '', name: 'All articles' }, ...data.topics] as t (t.slug)}
				{@const isActive = data.activeTopic === t.slug}
				<a
					href={t.slug ? `/blog?topic=${t.slug}` : '/blog'}
					data-sveltekit-noscroll
					aria-current={isActive ? 'page' : undefined}
					class={cn(
						'shrink-0 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors',
						isActive ? 'bg-gold-500 text-forest-950' : 'bg-cream/10 text-cream hover:bg-cream/20 ring-1 ring-white/20'
					)}
				>
					{t.name}
				</a>
			{/each}
		</nav>
	{/if}
</PageHero>

<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
	{#if data.posts.length}
		{#key `${data.activeTopic}-${data.page}`}
			{#if featured}
				<article class="group relative mb-16 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12" {@attach reveal()}>
					<div class="bg-forest-100 aspect-[16/10] overflow-hidden rounded-3xl">
						{#if featured.coverImage}
							<img
								src={featured.coverImage.url}
								alt={featured.coverImage.alt}
								fetchpriority="high"
								class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
							/>
						{/if}
					</div>
					<div>
						<p class="text-gold-600 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
							<span>Latest</span>
							{#if featured.service}<span class="bg-gold-500 size-1 rounded-full"></span><span>{featured.service.name}</span>{/if}
							<span class="bg-gold-500 size-1 rounded-full"></span>
							<time datetime={featured.publishedAt ? new Date(featured.publishedAt).toISOString() : undefined}>{formatDate(featured.publishedAt)}</time>
						</p>
						<h2 class="font-heading text-forest-900 mt-3 text-3xl leading-tight font-bold text-balance sm:text-4xl">
							<a href="/blog/{featured.slug}" class="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none">{featured.title}</a>
						</h2>
						{#if featured.excerpt}<p class="text-ink/70 mt-4 line-clamp-4 text-lg">{featured.excerpt}</p>{/if}
						<span class="text-forest-800 mt-6 inline-flex items-center gap-2 text-sm font-bold">
							Read article <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
						</span>
					</div>
				</article>
			{/if}

			{#if rest.length}
				<ul class="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.08, start: 'top 95%' })}>
					{#each rest as post (post.id)}
						<li><BlogCard {post} headingLevel={2} /></li>
					{/each}
				</ul>
			{/if}
		{/key}

		{#if data.pageCount > 1}
			<nav aria-label="Pagination" class="mt-16 flex items-center justify-center gap-2">
				{#if data.page > 1}
					<a href={pageHref(data.page - 1)} class="text-forest-800 hover:bg-forest-100 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
						<ArrowLeftIcon class="size-4" /> Newer
					</a>
				{/if}
				<ol class="flex items-center gap-1">
					{#each Array.from({ length: data.pageCount }, (_, i) => i + 1) as n (n)}
						<li>
							<a
								href={pageHref(n)}
								aria-current={n === data.page ? 'page' : undefined}
								class={cn(
									'flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors',
									n === data.page ? 'bg-forest-800 text-cream' : 'text-forest-800 hover:bg-forest-100'
								)}
							>
								{n}
							</a>
						</li>
					{/each}
				</ol>
				{#if data.page < data.pageCount}
					<a href={pageHref(data.page + 1)} class="text-forest-800 hover:bg-forest-100 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
						Older <ArrowRightIcon class="size-4" />
					</a>
				{/if}
			</nav>
		{/if}
	{:else}
		<div class="mx-auto max-w-lg py-10 text-center">
			<h2 class="font-heading text-forest-900 text-2xl font-bold">Stories are on their way</h2>
			<p class="text-ink/65 mt-3">Our team is writing new guides. In the meantime, ask us anything about your trip.</p>
			<a href="/contact" class="bg-forest-800 text-cream hover:bg-forest-700 mt-6 inline-flex rounded-full px-6 py-3 text-sm font-bold">Contact us</a>
		</div>
	{/if}
</section>

<PlanCta
	whatsappNumber={data.site.whatsappNumber}
	email={data.site.email}
	address={data.site.address}
	officeHours={data.site.officeHours}
	image={data.posts.find((p) => p.coverImage)?.coverImage?.url ?? null}
/>

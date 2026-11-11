<script lang="ts">
	import Seo from '#lib/components/public/seo.svelte';
	import { page } from '$app/state';
	import LatestStories from '#lib/components/public/home/latest-stories.svelte';
	import { reveal } from '#lib/components/public/reveal.js';
	import WhatsAppButton from '#lib/components/public/whatsapp-button.svelte';
	import { formatDate } from '#lib/format.js';
	import { cn } from '#lib/utils.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const post = $derived(data.post);
	const metaTitle = $derived(post.seoTitle || `${post.title} | ${data.site.companyName}`);
	const metaDescription = $derived(post.seoDescription || post.excerpt);
	const canonical = $derived(page.url.origin + page.url.pathname);
	const published = $derived(post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined);

	// Structured data for search engines. "<" is escaped so content can't close the script tag.
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.title,
			description: metaDescription || undefined,
			image: post.coverImage?.url,
			datePublished: published,
			dateModified: new Date(post.updatedAt).toISOString(),
			url: canonical,
			author: post.author?.name
				? { '@type': 'Person', name: post.author.name }
				: { '@type': 'Organization', name: data.site.companyName },
			publisher: { '@type': 'TravelAgency', name: data.site.companyName }
		}).replace(/</g, '\\u003c')
	);
</script>

<Seo
	site={data.site}
	title={metaTitle}
	description={metaDescription}
	ogTitle={post.title}
	type="article"
	image={post.coverImage?.url}
	imageAlt={post.coverImage?.alt}
>
	{#if published}<meta property="article:published_time" content={published} />{/if}
	{#if post.service}<meta property="article:section" content={post.service.name} />{/if}
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</Seo>

<section class={cn('bg-forest-950 relative isolate flex items-end overflow-hidden', post.coverImage && 'min-h-[62svh]')}>
	{#if post.coverImage}
		<img
			src={post.coverImage.url}
			alt={post.coverImage.alt}
			fetchpriority="high"
			data-speed="0.85"
			class="absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover"
		/>
		<div class="from-forest-950 via-forest-950/60 absolute inset-0 -z-10 bg-linear-to-t to-black/30"></div>
	{:else}
		<div class="bg-gold-500/15 pointer-events-none absolute -top-32 right-0 -z-10 size-[28rem] rounded-full blur-3xl"></div>
	{/if}
	<div
		class={cn('relative mx-auto w-full max-w-4xl px-4 pb-14 sm:px-6 lg:px-8', post.coverImage ? 'pt-32' : 'pt-16')}
		{@attach reveal({ selector: '[data-reveal]', stagger: 0.08, start: 'top 95%' })}
	>
		<nav data-reveal aria-label="Breadcrumb" class="text-paper/70 text-xs font-semibold">
			<ol class="flex flex-wrap items-center gap-2">
				<li><a href="/" class="hover:text-gold-300">Home</a></li>
				<li aria-hidden="true">/</li>
				<li><a href="/blog" class="hover:text-gold-300">Blog</a></li>
				{#if post.service}
					<li aria-hidden="true">/</li>
					<li><a href="/blog?topic={post.service.slug}" class="hover:text-gold-300">{post.service.name}</a></li>
				{/if}
			</ol>
		</nav>
		<h1 data-reveal class="font-display text-paper mt-6 text-4xl leading-[0.95] font-semibold uppercase text-balance sm:text-5xl">{post.title}</h1>
		{#if post.excerpt}<p data-reveal class="text-paper/80 mt-5 max-w-2xl text-lg">{post.excerpt}</p>{/if}
		<p data-reveal class="text-paper/70 mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
			{#if post.author?.name}<span class="text-paper">By {post.author.name}</span><span class="bg-gold-500 size-1 rounded-full"></span>{/if}
			<time datetime={published}>{formatDate(post.publishedAt)}</time>
			<span class="bg-gold-500 size-1 rounded-full"></span>
			<span class="inline-flex items-center gap-1.5"><ClockIcon class="size-4" /> {post.readingMinutes} min read</span>
		</p>
	</div>
	<div class="gold-rule absolute inset-x-0 bottom-0"></div>
</section>

<article class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
	{#if post.content}
		<!-- Sanitized on save (lib/server/sanitize.ts). -->
		<div class="prose prose-lg prose-stone prose-a:text-forest-700 prose-headings:font-display prose-headings:uppercase prose-headings:font-semibold prose-headings:text-forest-900 prose-img:rounded-md max-w-none">
			{@html post.content}
		</div>
	{/if}

	<aside class="bg-forest-900 text-paper relative isolate mt-16 overflow-hidden rounded-md p-8 sm:p-10" aria-labelledby="post-cta-title" {@attach reveal()}>
		<div class="bg-gold-500/20 pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full blur-3xl"></div>
		<span class="bg-gold-500 block h-0.5 w-10" aria-hidden="true"></span>
		<h2 id="post-cta-title" class="font-display mt-3 text-2xl font-semibold uppercase text-balance sm:text-3xl">
			{post.service ? `Talk to us about ${post.service.name}` : 'Let our team plan it for you'}
		</h2>
		<p class="text-paper/75 mt-3">
			{post.service?.summary || 'Tell us your dates, group and budget, and we will reply with options and prices.'}
		</p>
		<div class="mt-7 flex flex-wrap gap-3">
			<WhatsAppButton number={data.site.whatsappNumber} message={`Hi Altura, I just read "${post.title}" and I'd like some help planning.`} size="lg" />
			<a
				href={post.service ? `/contact?service=${post.service.slug}` : '/contact'}
				class="bg-paper text-forest-900 hover:bg-gold-300 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors"
			>
				Send an inquiry <ArrowRightIcon class="size-4" />
			</a>
			{#if post.service}
				<a href="/services/{post.service.slug}" class="text-paper hover:text-gold-300 inline-flex items-center gap-2 px-2 py-3.5 text-sm font-bold">
					About {post.service.name} <ArrowRightIcon class="size-4" />
				</a>
			{/if}
		</div>
	</aside>

	<a href="/blog" class="text-forest-800 hover:text-forest-600 mt-10 inline-flex items-center gap-2 text-sm font-bold">
		<ArrowLeftIcon class="size-4" /> All articles
	</a>
</article>

<LatestStories posts={data.related} title="More travel guides" intro="" />

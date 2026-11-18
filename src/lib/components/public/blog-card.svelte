<script lang="ts" module>
	export type BlogCardPost = {
		id: string;
		title: string;
		slug: string;
		excerpt: string;
		publishedAt: Date | string | null;
		coverImage: { url: string; thumbUrl: string; alt: string } | null;
		service: { name: string } | null;
	};
</script>

<script lang="ts">
	import { formatDate } from '#lib/format.js';
	import { LOGO } from './site.js';

	let { post, headingLevel = 3 }: { post: BlogCardPost; headingLevel?: 2 | 3 } = $props();
</script>

<article class="group relative flex h-full flex-col">
	<div class="bg-forest-100 aspect-[16/10] overflow-hidden rounded-md">
		{#if post.coverImage}
			<img
				src={post.coverImage.url}
				alt={post.coverImage.alt}
				loading="lazy"
				decoding="async"
				class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
		{:else}
			<div class="flex size-full items-center justify-center"><img src={LOGO.mark} alt="" class="w-1/4 opacity-30 grayscale" loading="lazy" /></div>
		{/if}
	</div>
	<span class="bg-gold-500 mt-5 block h-0.5 w-6" aria-hidden="true"></span>
	<svelte:element this={`h${headingLevel}`} class="font-display text-forest-950 mt-3 text-2xl leading-[1] font-semibold uppercase text-balance">
		<a href="/blog/{post.slug}" class="decoration-gold-500 decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none">{post.title}</a>
	</svelte:element>
	<p class="text-ink/60 mt-2 text-sm">
		{#if post.service}{post.service.name} · {/if}<time datetime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>{formatDate(post.publishedAt)}</time>
	</p>
	{#if post.excerpt}<p class="text-ink/75 mt-3 line-clamp-3 text-sm leading-relaxed">{post.excerpt}</p>{/if}
</article>

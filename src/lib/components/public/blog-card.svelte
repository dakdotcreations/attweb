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
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { post, headingLevel = 3 }: { post: BlogCardPost; headingLevel?: 2 | 3 } = $props();
</script>

<article class="group relative flex h-full flex-col">
	<div class="bg-forest-100 aspect-[16/10] overflow-hidden rounded-3xl">
		{#if post.coverImage}
			<img
				src={post.coverImage.url}
				alt={post.coverImage.alt}
				loading="lazy"
				decoding="async"
				class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
		{/if}
	</div>
	<p class="text-gold-600 mt-5 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
		{#if post.service}<span>{post.service.name}</span><span class="bg-gold-500 size-1 rounded-full"></span>{/if}
		<time datetime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>{formatDate(post.publishedAt)}</time>
	</p>
	<svelte:element this={`h${headingLevel}`} class="text-forest-950 mt-2 text-lg leading-snug font-extrabold text-balance">
		<a href="/blog/{post.slug}" class="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none">{post.title}</a>
	</svelte:element>
	{#if post.excerpt}<p class="text-ink/70 mt-2 line-clamp-3 text-sm">{post.excerpt}</p>{/if}
	<span class="text-forest-800 mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold">
		Read article <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
	</span>
</article>

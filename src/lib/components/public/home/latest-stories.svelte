<script lang="ts">
	import { formatDate } from '#lib/format.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';

	type Post = {
		id: string;
		title: string;
		slug: string;
		excerpt: string;
		publishedAt: Date | null;
		coverImage: { url: string; thumbUrl: string; alt: string } | null;
		service: { name: string } | null;
	};

	let { posts }: { posts: Post[] } = $props();
</script>

{#if posts.length}
	<section class="bg-cream-200/60 py-20 sm:py-28" aria-labelledby="stories-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<SectionHeading
				id="stories-title"
				eyebrow="Travel guides"
				title="Plan with confidence"
				intro="Practical guides on gorilla permits, safaris, visas and more, written by our team."
				link={{ href: '/blog', label: 'All articles' }}
			/>
			<ul class="mt-12 grid gap-8 md:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.12 })}>
				{#each posts as post (post.id)}
					<li>
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
							<h3 class="text-forest-950 mt-2 text-lg leading-snug font-extrabold text-balance">
								<a href="/blog/{post.slug}" class="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none">{post.title}</a>
							</h3>
							{#if post.excerpt}<p class="text-ink/70 mt-2 line-clamp-3 text-sm">{post.excerpt}</p>{/if}
							<span class="text-forest-800 mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold">
								Read article <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
							</span>
						</article>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

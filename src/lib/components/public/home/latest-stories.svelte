<script lang="ts">
	import BlogCard, { type BlogCardPost } from '../blog-card.svelte';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';

	let {
		posts,
		eyebrow = 'Travel guides',
		title = 'Plan with confidence',
		intro = 'Practical guides on gorilla permits, safaris, visas and more, written by our team.'
	}: { posts: BlogCardPost[]; eyebrow?: string; title?: string; intro?: string } = $props();
</script>

{#if posts.length}
	<section class="bg-paper-200 py-20 sm:py-28" aria-labelledby="stories-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<SectionHeading id="stories-title" {eyebrow} {title} {intro} link={{ href: '/blog', label: 'All articles' }} />
			<ul class="mt-12 grid gap-8 md:grid-cols-3" {@attach reveal({ selector: ':scope > li', stagger: 0.12 })}>
				{#each posts as post (post.id)}
					<li><BlogCard {post} /></li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

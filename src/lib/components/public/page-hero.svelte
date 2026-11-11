<!--
	Inner-page hero: a dark band under the solid header, full-bleed photo behind when one is
	given (dark scrim, like the homepage), with the page name in condensed caps.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		intro,
		image = null,
		breadcrumbs = [],
		children
	}: {
		/** Accepted for older callers; not shown (labels above headings are off the system). */
		eyebrow?: string;
		title: string;
		intro?: string;
		image?: string | null;
		breadcrumbs?: { label: string; href: string }[];
		children?: Snippet;
	} = $props();
</script>

<section class="bg-forest-950 text-paper relative isolate overflow-hidden">
	{#if image}
		<img src={image} alt="" fetchpriority="high" class="absolute inset-0 -z-10 size-full object-cover" />
		<div class="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/45 to-black/20"></div>
		<div class="absolute inset-0 -z-10 bg-linear-to-t from-black/60 to-transparent"></div>
	{/if}
	<div class={['mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', image ? 'pt-24 pb-14 sm:pt-32 sm:pb-16 lg:pt-40' : 'py-16 sm:py-20']}>
		{#if breadcrumbs.length}
			<nav aria-label="Breadcrumb" class="text-paper/65 mb-8 text-xs font-semibold">
				<ol class="flex flex-wrap items-center gap-2">
					<li><a href="/" class="hover:text-gold-300">Home</a></li>
					{#each breadcrumbs as crumb (crumb.href)}
						<li aria-hidden="true">/</li>
						<li><a href={crumb.href} class="hover:text-gold-300">{crumb.label}</a></li>
					{/each}
				</ol>
			</nav>
		{/if}
		<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
		<h1 class="font-display mt-5 max-w-4xl text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-7xl">{title}</h1>
		{#if intro}<p class="text-paper/80 mt-5 max-w-2xl text-lg leading-relaxed">{intro}</p>{/if}
		{@render children?.()}
	</div>
</section>

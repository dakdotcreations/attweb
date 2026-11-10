<!-- Compact heading band for inner pages (sits under the solid header). -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow,
		title,
		intro,
		breadcrumbs = [],
		children
	}: {
		eyebrow?: string;
		title: string;
		intro?: string;
		breadcrumbs?: { label: string; href: string }[];
		children?: Snippet;
	} = $props();
</script>

<section class="bg-forest-900 text-cream relative isolate overflow-hidden">
	<div class="bg-gold-500/15 pointer-events-none absolute -top-32 right-0 -z-10 size-[28rem] rounded-full blur-3xl"></div>
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
		{#if breadcrumbs.length}
			<nav aria-label="Breadcrumb" class="text-cream/60 mb-5 text-xs font-semibold">
				<ol class="flex flex-wrap items-center gap-2">
					<li><a href="/" class="hover:text-gold-300">Home</a></li>
					{#each breadcrumbs as crumb (crumb.href)}
						<li aria-hidden="true">/</li>
						<li><a href={crumb.href} class="hover:text-gold-300">{crumb.label}</a></li>
					{/each}
				</ol>
			</nav>
		{/if}
		{#if eyebrow}<p class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">{eyebrow}</p>{/if}
		<h1 class="font-heading mt-3 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">{title}</h1>
		{#if intro}<p class="text-cream/75 mt-5 max-w-2xl text-lg">{intro}</p>{/if}
		{@render children?.()}
	</div>
	<div class="gold-rule absolute inset-x-0 bottom-0"></div>
</section>

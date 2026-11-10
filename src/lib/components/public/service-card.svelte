<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { serviceIcon } from './service-icons.js';

	let {
		service
	}: {
		service: { name: string; slug: string; summary: string; coverImage: { url?: string; thumbUrl: string; alt: string } | null };
	} = $props();

	const Icon = $derived(serviceIcon(service.slug, service.name));
</script>

<article class="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-xl">
	<div class="bg-forest-800 relative aspect-[16/10] overflow-hidden">
		{#if service.coverImage}
			<img
				src={service.coverImage.url ?? service.coverImage.thumbUrl}
				alt={service.coverImage.alt}
				loading="lazy"
				decoding="async"
				class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
			/>
		{:else}
			<div class="from-forest-700 to-forest-950 size-full bg-linear-to-br"></div>
		{/if}
		<span class="bg-forest-900 text-gold-400 ring-cream absolute -bottom-6 left-6 flex size-12 items-center justify-center rounded-full ring-4">
			<Icon class="size-6" />
		</span>
	</div>
	<div class="flex flex-1 flex-col p-6 pt-9">
		<h3 class="text-forest-950 text-xl font-extrabold">
			<a href="/services/{service.slug}" class="after:absolute after:inset-0 focus-visible:outline-none">{service.name}</a>
		</h3>
		{#if service.summary}<p class="text-ink/70 mt-2 line-clamp-3 text-sm">{service.summary}</p>{/if}
		<span class="text-forest-800 mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold">
			Explore <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
		</span>
	</div>
	<span class="group-has-[a:focus-visible]:ring-gold-500 pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-transparent"></span>
</article>

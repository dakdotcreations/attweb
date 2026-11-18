<!-- Bento photo grid (first image large) that opens the full-screen Lightbox. -->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ImagesIcon from '@lucide/svelte/icons/images';
	import Lightbox from './lightbox.svelte';

	type Photo = { id: string; url: string; thumbUrl: string; alt: string; caption: string | null };

	let { photos, title }: { photos: Photo[]; title: string } = $props();

	let lightbox = $state<ReturnType<typeof Lightbox>>();
	const preview = $derived(photos.slice(0, 5));
</script>

{#if photos.length}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
		{#each preview as photo, i (photo.id)}
			<button
				type="button"
				class={cn(
					'group bg-forest-100 focus-visible:ring-gold-500 relative overflow-hidden rounded-md focus-visible:ring-4 focus-visible:outline-none',
					i === 0 ? 'col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto' : 'aspect-square',
					i >= 3 && 'hidden sm:block'
				)}
				onclick={() => lightbox?.open(i)}
				aria-label="Open photo {i + 1} of {photos.length}{photo.alt ? `: ${photo.alt}` : ''}"
			>
				<img
					src={i === 0 ? photo.url : photo.thumbUrl}
					alt={photo.alt}
					loading="lazy"
					decoding="async"
					class="size-full object-cover transition-transform duration-700 group-hover:scale-105"
				/>
				{#if i === preview.length - 1 && photos.length > preview.length}
					<span class="bg-forest-950/60 text-paper absolute inset-0 flex items-center justify-center gap-2 text-sm font-bold">
						<ImagesIcon class="size-5" /> +{photos.length - preview.length} photos
					</span>
				{/if}
			</button>
		{/each}
	</div>
	{#if photos.length > 1}
		<button type="button" class="text-forest-800 hover:text-forest-600 mt-4 inline-flex items-center gap-2 text-sm font-bold" onclick={() => lightbox?.open(0)}>
			<ImagesIcon class="size-4" /> View all {photos.length} photos
		</button>
	{/if}

	<Lightbox bind:this={lightbox} {photos} {title} />
{/if}

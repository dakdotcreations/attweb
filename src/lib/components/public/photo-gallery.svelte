<!--
	Bento photo grid (first image large) with a full-screen lightbox.
	The lightbox is a native <dialog>, which renders in the top layer, so it works inside
	the ScrollSmoother wrapper and gets focus trapping + Escape for free.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ImagesIcon from '@lucide/svelte/icons/images';
	import XIcon from '@lucide/svelte/icons/x';

	type Photo = { id: string; url: string; thumbUrl: string; alt: string; caption: string | null };

	let { photos, title }: { photos: Photo[]; title: string } = $props();

	let dialog = $state<HTMLDialogElement>();
	let current = $state(0);
	const preview = $derived(photos.slice(0, 5));
	const photo = $derived(photos[current] ?? photos[0]);

	function open(i: number) {
		current = i;
		dialog?.showModal();
	}
	const step = (d: number) => (current = (current + d + photos.length) % photos.length);

	let touchX: number | null = null;
</script>

{#if photos.length}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
		{#each preview as photo, i (photo.id)}
			<button
				type="button"
				class={cn(
					'group bg-forest-100 focus-visible:ring-gold-500 relative overflow-hidden rounded-2xl focus-visible:ring-4 focus-visible:outline-none',
					i === 0 ? 'col-span-2 aspect-[4/3] sm:row-span-2 sm:aspect-auto' : 'aspect-square',
					i >= 3 && 'hidden sm:block'
				)}
				onclick={() => open(i)}
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
					<span class="bg-forest-950/60 text-cream absolute inset-0 flex items-center justify-center gap-2 text-sm font-bold">
						<ImagesIcon class="size-5" /> +{photos.length - preview.length} photos
					</span>
				{/if}
			</button>
		{/each}
	</div>
	{#if photos.length > 1}
		<button type="button" class="text-forest-800 hover:text-forest-600 mt-4 inline-flex items-center gap-2 text-sm font-bold" onclick={() => open(0)}>
			<ImagesIcon class="size-4" /> View all {photos.length} photos
		</button>
	{/if}

	<dialog
		bind:this={dialog}
		class="bg-forest-950/97 m-0 h-dvh max-h-none w-screen max-w-none p-0 text-cream backdrop:bg-black/80"
		aria-label="{title} photos"
		onkeydown={(e) => {
			if (e.key === 'ArrowRight') step(1);
			if (e.key === 'ArrowLeft') step(-1);
		}}
		ontouchstart={(e) => (touchX = e.touches[0].clientX)}
		ontouchend={(e) => {
			if (touchX == null) return;
			const dx = e.changedTouches[0].clientX - touchX;
			if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
			touchX = null;
		}}
	>
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between px-4 py-3 sm:px-6">
				<p class="text-cream/70 text-sm font-semibold tabular-nums">{current + 1} / {photos.length}</p>
				<button type="button" class="hover:bg-cream/10 rounded-full p-2" aria-label="Close" onclick={() => dialog?.close()}>
					<XIcon class="size-6" />
				</button>
			</div>
			<figure class="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-6 sm:px-20">
				{#key photo.id}
					<img src={photo.url} alt={photo.alt} class="max-h-full max-w-full rounded-lg object-contain" />
				{/key}
				{#if photo.caption || photo.alt}
					<figcaption class="text-cream/75 mt-4 max-w-2xl text-center text-sm">{photo.caption ?? photo.alt}</figcaption>
				{/if}
				{#if photos.length > 1}
					<button
						type="button"
						class="bg-cream/10 hover:bg-cream/20 absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full p-3 sm:block"
						aria-label="Previous photo"
						onclick={() => step(-1)}
					>
						<ChevronLeftIcon class="size-6" />
					</button>
					<button
						type="button"
						class="bg-cream/10 hover:bg-cream/20 absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full p-3 sm:block"
						aria-label="Next photo"
						onclick={() => step(1)}
					>
						<ChevronRightIcon class="size-6" />
					</button>
				{/if}
			</figure>
		</div>
	</dialog>
{/if}

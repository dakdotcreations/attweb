<!--
	Full-screen photo viewer. Call `open(index)` via bind:this.

	- Native <dialog> (top layer), so it works inside the ScrollSmoother wrapper and gets focus
	  trapping and Escape for free.
	- Each open photo gets its own URL (?photo=id) through shallow routing: Back closes the viewer
	  and a copied link opens straight onto the photo.
	- The thumbnail shows instantly while the full image loads on top; neighbours are preloaded.
	- Arrows, swipe left/right, swipe down to close; controls stay visible on phones.
-->
<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import XIcon from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	type Photo = { id: string; url: string; thumbUrl?: string; alt: string; caption: string | null };

	let { photos, title }: { photos: Photo[]; title: string } = $props();

	let dialog = $state<HTMLDialogElement>();
	let current = $state(0);
	let loaded = $state(false);
	const photo = $derived(photos[current] ?? photos[0]);

	function urlFor(id: string | null) {
		const url = new URL(page.url.href);
		if (id) url.searchParams.set('photo', id);
		else url.searchParams.delete('photo');
		return url;
	}

	export function open(i: number) {
		current = i;
		loaded = false;
		dialog?.showModal();
		pushState(urlFor(photos[i].id), { ...page.state, photo: photos[i].id });
	}

	function step(d: number) {
		if (photos.length < 2) return;
		current = (current + d + photos.length) % photos.length;
		loaded = false;
		replaceState(urlFor(photos[current].id), { ...page.state, photo: photos[current].id });
	}

	function close() {
		dialog?.close();
	}

	// Dialog closed (button, Escape, swipe): leave the photo's history entry too.
	function onClose() {
		if (page.state.photo) history.back();
	}

	// Back button while open: the shallow entry is gone, so close the viewer.
	$effect(() => {
		if (!page.state.photo && dialog?.open) dialog.close();
	});

	// A shared ?photo= link opens straight onto that photo.
	onMount(() => {
		const id = page.url.searchParams.get('photo');
		const i = id ? photos.findIndex((p) => p.id === id) : -1;
		if (i < 0) return;
		current = i;
		dialog?.showModal();
		replaceState(page.url.href, { ...page.state, photo: id! });
	});

	// Preload the neighbours so stepping feels instant.
	$effect(() => {
		if (!dialog?.open || photos.length < 2) return;
		for (const d of [1, -1]) new Image().src = photos[(current + d + photos.length) % photos.length].url;
	});

	let touch: { x: number; y: number } | null = null;
	function onTouchEnd(e: TouchEvent) {
		if (!touch || e.changedTouches.length !== 1) return;
		const dx = e.changedTouches[0].clientX - touch.x;
		const dy = e.changedTouches[0].clientY - touch.y;
		touch = null;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
		else if (dy > 90 && dy > Math.abs(dx)) close();
	}
</script>

<dialog
	bind:this={dialog}
	class="bg-forest-950 text-paper m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-black/80"
	aria-label="{title} photos"
	onclose={onClose}
	onkeydown={(e) => {
		if (e.key === 'ArrowRight') step(1);
		if (e.key === 'ArrowLeft') step(-1);
	}}
	ontouchstart={(e) => (touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null)}
	ontouchend={onTouchEnd}
>
	{#if photo}
		<div class="flex h-full flex-col">
			<div class="flex items-center justify-between px-4 py-3 sm:px-6">
				<p class="text-paper/70 text-sm font-semibold tabular-nums" aria-live="polite">{current + 1} / {photos.length}</p>
				<button type="button" class="hover:bg-paper/10 focus-visible:ring-gold-400 rounded-full p-2 focus-visible:ring-2 focus-visible:outline-none" aria-label="Close" onclick={close}>
					<XIcon class="size-6" />
				</button>
			</div>

			<figure class="relative flex min-h-0 flex-1 flex-col items-center justify-center px-2 sm:px-20">
				{#key photo.id}
					<div class="relative flex max-h-full min-h-0 max-w-full items-center justify-center">
						{#if photo.thumbUrl && !loaded}
							<!-- Thumbnail placeholder, stretched to the same box until the full image lands. -->
							<img src={photo.thumbUrl} alt="" class="absolute inset-0 m-auto max-h-full max-w-full object-contain blur-[2px]" />
						{/if}
						<img
							src={photo.url}
							alt={photo.alt}
							onload={() => (loaded = true)}
							class="relative max-h-[calc(100dvh-9rem)] max-w-full object-contain transition-opacity duration-300 {loaded ? 'opacity-100' : 'opacity-0'}"
						/>
					</div>
				{/key}
				{#if photo.caption || photo.alt}
					<figcaption class="text-paper/75 mt-3 max-w-2xl px-4 text-center text-sm">{photo.caption ?? photo.alt}</figcaption>
				{/if}

				{#if photos.length > 1}
					<button
						type="button"
						class="bg-paper/10 hover:bg-paper/20 focus-visible:ring-gold-400 absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full p-3 focus-visible:ring-2 focus-visible:outline-none sm:block"
						aria-label="Previous photo"
						onclick={() => step(-1)}
					>
						<ChevronLeftIcon class="size-6" />
					</button>
					<button
						type="button"
						class="bg-paper/10 hover:bg-paper/20 focus-visible:ring-gold-400 absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full p-3 focus-visible:ring-2 focus-visible:outline-none sm:block"
						aria-label="Next photo"
						onclick={() => step(1)}
					>
						<ChevronRightIcon class="size-6" />
					</button>
				{/if}
			</figure>

			<!-- Phone controls in thumb reach (swipe works too). -->
			{#if photos.length > 1}
				<div class="flex items-center justify-between px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
					<button type="button" class="bg-paper/10 rounded-full p-3" aria-label="Previous photo" onclick={() => step(-1)}>
						<ChevronLeftIcon class="size-6" />
					</button>
					<p class="text-paper/55 text-xs">Swipe down to close</p>
					<button type="button" class="bg-paper/10 rounded-full p-3" aria-label="Next photo" onclick={() => step(1)}>
						<ChevronRightIcon class="size-6" />
					</button>
				</div>
			{/if}
		</div>
	{/if}
</dialog>

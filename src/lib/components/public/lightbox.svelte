<!--
	Full-screen photo viewer. Call `open(index)` via bind:this.
	It's a native <dialog>, which renders in the top layer, so it works inside the
	ScrollSmoother wrapper and gets focus trapping + Escape for free.
-->
<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import XIcon from '@lucide/svelte/icons/x';

	type Photo = { id: string; url: string; alt: string; caption: string | null };

	let { photos, title }: { photos: Photo[]; title: string } = $props();

	let dialog = $state<HTMLDialogElement>();
	let current = $state(0);
	const photo = $derived(photos[current] ?? photos[0]);

	export function open(i: number) {
		current = i;
		dialog?.showModal();
	}
	const step = (d: number) => (current = (current + d + photos.length) % photos.length);

	let touchX: number | null = null;
</script>

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
	{#if photo}
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
	{/if}
</dialog>

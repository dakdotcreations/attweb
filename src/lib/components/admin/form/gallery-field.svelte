<!-- Ordered list of images from the media library (package galleries). -->
<script lang="ts">
	import MediaPicker from '#lib/components/admin/media/media-picker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { MediaRef } from '#lib/media.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';

	let { value = $bindable([]) }: { value?: MediaRef[] } = $props();

	let pickerOpen = $state(false);

	function move(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= value.length) return;
		const next = [...value];
		[next[index], next[target]] = [next[target], next[index]];
		value = next;
	}
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
	{#each value as image, index (image.id)}
		<div class="group bg-muted relative aspect-4/3 overflow-hidden rounded-lg border">
			<img src={image.thumbUrl} alt={image.alt} class="size-full object-cover" />
			<div
				class="absolute inset-x-0 bottom-0 flex justify-between bg-linear-to-t from-black/60 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
			>
				<div class="flex gap-1">
					<Button type="button" size="icon-sm" variant="secondary" disabled={index === 0} onclick={() => move(index, -1)} aria-label="Move earlier">
						<ArrowLeftIcon />
					</Button>
					<Button
						type="button"
						size="icon-sm"
						variant="secondary"
						disabled={index === value.length - 1}
						onclick={() => move(index, 1)}
						aria-label="Move later"
					>
						<ArrowRightIcon />
					</Button>
				</div>
				<Button
					type="button"
					size="icon-sm"
					variant="destructive"
					onclick={() => (value = value.filter((v) => v.id !== image.id))}
					aria-label="Remove from gallery"
				>
					<XIcon />
				</Button>
			</div>
			{#if index === 0}
				<span class="bg-background/90 absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium">First</span>
			{/if}
		</div>
	{/each}
	<button
		type="button"
		class="text-muted-foreground hover:bg-muted/50 focus-visible:ring-ring flex aspect-4/3 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm focus-visible:ring-2 focus-visible:outline-none"
		onclick={() => (pickerOpen = true)}
	>
		<PlusIcon class="size-5" />
		Add images
	</button>
</div>

<MediaPicker
	bind:open={pickerOpen}
	multiple
	title="Add gallery images"
	onSelect={(items) => {
		const existing = new Set(value.map((v) => v.id));
		value = [
			...value,
			...items
				.filter((item) => !existing.has(item.id))
				.map((item) => ({ id: item.id, thumbUrl: item.thumbUrl, alt: item.alt }))
		];
	}}
/>

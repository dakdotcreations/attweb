<!-- Single image (e.g. cover photo) chosen from the media library. -->
<script lang="ts">
	import MediaPicker from '#lib/components/admin/media/media-picker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { MediaRef } from '#lib/media.js';
	import ImageIcon from '@lucide/svelte/icons/image';

	let {
		value = $bindable(null),
		label = 'Image'
	}: { value?: MediaRef | null; label?: string } = $props();

	let pickerOpen = $state(false);
</script>

<div class="flex items-center gap-4">
	<button
		type="button"
		class="bg-muted text-muted-foreground hover:bg-muted/70 focus-visible:ring-ring flex aspect-4/3 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
		onclick={() => (pickerOpen = true)}
		aria-label={value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
	>
		{#if value}
			<img src={value.thumbUrl} alt={value.alt} class="size-full object-cover" />
		{:else}
			<ImageIcon class="size-6" />
		{/if}
	</button>
	<div class="flex flex-col gap-2">
		<Button type="button" variant="outline" size="sm" onclick={() => (pickerOpen = true)}>
			{value ? 'Change' : 'Choose image'}
		</Button>
		{#if value}
			<Button type="button" variant="ghost" size="sm" onclick={() => (value = null)}>Remove</Button>
		{/if}
	</div>
</div>

<MediaPicker
	bind:open={pickerOpen}
	title="Choose {label.toLowerCase()}"
	onSelect={([item]) => {
		if (item) value = { id: item.id, thumbUrl: item.thumbUrl, alt: item.alt, url: item.url };
	}}
/>

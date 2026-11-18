<script lang="ts">
	import { goto, refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import MediaEditDialog from '#lib/components/admin/media/media-edit-dialog.svelte';
	import MediaUploader from '#lib/components/admin/media/media-uploader.svelte';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import type { MediaItem } from '#lib/media.js';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let showUploader = $state(false);
	let editing = $state<MediaItem | null>(null);
	let q = $state('');
	let galleryOnly = $state(false);

	// Keep the filter inputs in sync with the URL (back/forward, links).
	$effect.pre(() => {
		q = data.q;
		galleryOnly = data.galleryOnly;
	});

	function applyFilters(pageNumber = 1) {
		const params = new URLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (galleryOnly) params.set('gallery', '1');
		if (pageNumber > 1) params.set('page', String(pageNumber));
		const search = params.size ? `?${params}` : '';
		// Filtering replaces history and keeps focus in the search box; paging scrolls to top.
		const paging = pageNumber !== data.page;
		goto(`${page.url.pathname}${search}`, { replace: !paging, reset: paging });
	}

	let searchTimer: ReturnType<typeof setTimeout>;
	function onSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => applyFilters(), 300);
	}
</script>

<PageHeader title="Media" description="Images used across the website. {data.total} total.">
	{#snippet actions()}
		<Button onclick={() => (showUploader = !showUploader)}>
			<UploadIcon data-icon="inline-start" />
			{showUploader ? 'Hide upload' : 'Upload'}
		</Button>
	{/snippet}
</PageHeader>

{#if showUploader}
	<MediaUploader class="mb-6" onAllDone={() => refreshAll()} />
{/if}

<div class="mb-4 flex flex-wrap items-center gap-4">
	<Input
		type="search"
		placeholder="Search file name, alt text, caption, category…"
		class="max-w-sm"
		bind:value={q}
		oninput={onSearch}
	/>
	<div class="flex items-center gap-2">
		<Switch id="galleryOnly" bind:checked={galleryOnly} onCheckedChange={() => applyFilters()} />
		<Label for="galleryOnly" class="font-normal">Gallery images only</Label>
	</div>
</div>

{#if data.items.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		{#if data.q || data.galleryOnly}
			No images match these filters.
		{:else}
			No images yet. Click <span class="text-foreground font-medium">Upload</span> to add some.
		{/if}
	</div>
{:else}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
		{#each data.items as item (item.id)}
			<button
				type="button"
				class="group bg-muted focus-visible:ring-ring relative aspect-square overflow-hidden rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none"
				onclick={() => (editing = item)}
				title={item.filename}
			>
				<img
					src={item.thumbUrl}
					alt={item.alt}
					loading="lazy"
					class="size-full object-cover transition-transform group-hover:scale-105"
				/>
				<div class="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-linear-to-t from-black/60 to-transparent p-2">
					{#if item.showInGallery}
						<Badge variant="secondary" class="text-[10px]">Gallery</Badge>
					{/if}
					{#if !item.alt}
						<Badge variant="destructive" class="text-[10px]">No alt text</Badge>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	{#if data.pageCount > 1}
		<div class="mt-6 flex items-center justify-center gap-2 text-sm">
			<Button variant="outline" size="sm" disabled={data.page <= 1} onclick={() => applyFilters(data.page - 1)}>
				Previous
			</Button>
			<span class="text-muted-foreground">Page {data.page} of {data.pageCount}</span>
			<Button
				variant="outline"
				size="sm"
				disabled={data.page >= data.pageCount}
				onclick={() => applyFilters(data.page + 1)}
			>
				Next
			</Button>
		</div>
	{/if}
{/if}

<MediaEditDialog bind:media={editing} categories={data.categories} />

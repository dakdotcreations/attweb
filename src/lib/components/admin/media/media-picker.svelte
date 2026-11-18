<!--
	Dialog for choosing images from the library (or uploading new ones).
	Used by content forms in Phase 4:

	<MediaPicker bind:open multiple onSelect={(items) => ...} />
	onSelect receives only the newly chosen items; the form merges them into its own list.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { MediaItem } from '#lib/media.js';
	import { cn } from '#lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { untrack } from 'svelte';
	import MediaUploader from './media-uploader.svelte';

	let {
		open = $bindable(false),
		multiple = false,
		title = multiple ? 'Choose images' : 'Choose an image',
		onSelect
	}: {
		open?: boolean;
		multiple?: boolean;
		title?: string;
		onSelect: (items: MediaItem[]) => void;
	} = $props();

	type Page = { items: MediaItem[]; page: number; pageCount: number; total: number };

	let q = $state('');
	let result = $state<Page | null>(null);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let showUploader = $state(false);
	// Keep chosen items (not just ids) so selections survive searching/paging.
	let chosen = $state.raw<Map<string, MediaItem>>(new Map());
	let requestId = 0;

	async function load(page = 1) {
		const id = ++requestId;
		loading = true;
		loadError = null;
		try {
			const params = new URLSearchParams({ page: String(page) });
			if (q.trim()) params.set('q', q.trim());
			const res = await fetch(`/dashboard/media/library?${params}`);
			if (!res.ok) throw new Error();
			const data: Page = await res.json();
			if (id === requestId) result = data;
		} catch {
			if (id === requestId) loadError = 'Could not load images.';
		} finally {
			if (id === requestId) loading = false;
		}
	}

	// Fresh state each time the dialog opens. Only `open` is tracked; load() reads `q`.
	$effect(() => {
		if (!open) return;
		untrack(() => {
			q = '';
			showUploader = false;
			chosen = new Map();
			void load(1);
		});
	});

	let searchTimer: ReturnType<typeof setTimeout>;
	function onSearch() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => load(1), 250);
	}

	function toggle(item: MediaItem) {
		const next = new Map(multiple ? chosen : []);
		if (chosen.has(item.id)) next.delete(item.id);
		else next.set(item.id, item);
		chosen = next;
	}

	function confirm() {
		onSelect([...chosen.values()]);
		open = false;
	}

	function handleUploaded(media: MediaItem) {
		// New uploads appear first and are selected automatically.
		if (result) result = { ...result, items: [media, ...result.items], total: result.total + 1 };
		const next = new Map(multiple ? chosen : []);
		next.set(media.id, media);
		chosen = next;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[90svh] flex-col sm:max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-wrap items-center gap-2">
			<Input
				type="search"
				placeholder="Search by file name, alt text, caption…"
				class="min-w-0 flex-1"
				bind:value={q}
				oninput={onSearch}
			/>
			<Button variant="outline" onclick={() => (showUploader = !showUploader)}>
				{showUploader ? 'Hide upload' : 'Upload new'}
			</Button>
		</div>

		{#if showUploader}
			<MediaUploader onUploaded={handleUploaded} />
		{/if}

		<div class="min-h-48 flex-1 overflow-y-auto">
			{#if loadError}
				<p class="text-destructive py-8 text-center text-sm">{loadError}</p>
			{:else if result && result.items.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					{q ? 'No images match your search.' : 'No images yet. Upload one to get started.'}
				</p>
			{:else if result}
				<div class={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6', loading && 'opacity-60')}>
					{#each result.items as item (item.id)}
						{@const isChosen = chosen.has(item.id)}
						<button
							type="button"
							class={cn(
								'bg-muted focus-visible:ring-ring relative aspect-square overflow-hidden rounded-lg ring-offset-2 focus-visible:ring-2 focus-visible:outline-none',
								isChosen && 'ring-primary ring-2'
							)}
							aria-pressed={isChosen}
							title={item.alt || item.filename}
							onclick={() => toggle(item)}
						>
							<img src={item.thumbUrl} alt={item.alt} loading="lazy" class="size-full object-cover" />
							{#if isChosen}
								<span class="bg-primary text-primary-foreground absolute top-1 right-1 rounded-full p-0.5">
									<CheckIcon class="size-3.5" />
								</span>
							{/if}
						</button>
					{/each}
				</div>
				{#if result.pageCount > 1}
					<div class="mt-3 flex items-center justify-center gap-2 text-sm">
						<Button variant="outline" size="sm" disabled={result.page <= 1 || loading} onclick={() => load(result!.page - 1)}>
							Previous
						</Button>
						<span class="text-muted-foreground">Page {result.page} of {result.pageCount}</span>
						<Button
							variant="outline"
							size="sm"
							disabled={result.page >= result.pageCount || loading}
							onclick={() => load(result!.page + 1)}
						>
							Next
						</Button>
					</div>
				{/if}
			{:else}
				<p class="text-muted-foreground py-8 text-center text-sm">Loading…</p>
			{/if}
		</div>

		<Dialog.Footer>
			<span class="text-muted-foreground mr-auto self-center text-sm">
				{chosen.size} selected
			</span>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button disabled={chosen.size === 0} onclick={confirm}>Use {multiple ? 'selected' : 'image'}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

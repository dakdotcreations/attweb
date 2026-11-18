<!--
	Drag-and-drop / file-picker uploader. Files upload one at a time to
	/dashboard/media/upload so each request stays under the size limit.
-->
<script lang="ts">
	import { Label } from '#lib/components/ui/label/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import {
		ACCEPTED_IMAGE_TYPES,
		MAX_UPLOAD_BYTES,
		formatBytes,
		type MediaItem
	} from '#lib/media.js';
	import { cn } from '#lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import UploadIcon from '@lucide/svelte/icons/upload';

	let {
		onUploaded,
		onAllDone,
		class: className
	}: {
		/** Called after each successful upload. */
		onUploaded?: (media: MediaItem) => void;
		/** Called once the current batch finishes (any outcome). */
		onAllDone?: () => void;
		class?: string;
	} = $props();

	type QueueItem = {
		key: string;
		file: File;
		status: 'pending' | 'uploading' | 'done' | 'error';
		error?: string;
	};

	let compress = $state(true);
	let dragging = $state(false);
	let queue = $state<QueueItem[]>([]);
	let running = false;
	let input = $state<HTMLInputElement>();

	function addFiles(files: FileList | File[] | null | undefined) {
		if (!files?.length) return;
		for (const file of files) {
			const item: QueueItem = { key: crypto.randomUUID(), file, status: 'pending' };
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				item.status = 'error';
				item.error = 'Not a supported image (JPEG, PNG, WebP, AVIF, GIF).';
			} else if (file.size > MAX_UPLOAD_BYTES) {
				item.status = 'error';
				item.error = `${formatBytes(file.size)} is over the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`;
			}
			queue.push(item);
		}
		if (input) input.value = '';
		void run();
	}

	async function run() {
		if (running) return;
		running = true;
		let item: QueueItem | undefined;
		while ((item = queue.find((q) => q.status === 'pending'))) {
			item.status = 'uploading';
			try {
				const body = new FormData();
				body.set('file', item.file);
				body.set('compress', String(compress));
				const res = await fetch('/dashboard/media/upload', { method: 'POST', body });
				const payload = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(payload.error ?? `Upload failed (${res.status}).`);
				item.status = 'done';
				onUploaded?.(payload.media as MediaItem);
			} catch (err) {
				item.status = 'error';
				item.error = err instanceof Error ? err.message : 'Upload failed.';
			}
		}
		running = false;
		onAllDone?.();
	}

	function clearFinished() {
		queue = queue.filter((q) => q.status === 'pending' || q.status === 'uploading');
	}

	const finishedCount = $derived(queue.filter((q) => q.status === 'done' || q.status === 'error').length);
</script>

<div class={cn('space-y-3', className)}>
	<button
		type="button"
		class={cn(
			'border-input hover:bg-muted/50 focus-visible:ring-ring flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none',
			dragging && 'border-primary bg-primary/5'
		)}
		onclick={() => input?.click()}
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={(e) => {
			e.preventDefault();
			dragging = false;
			addFiles(e.dataTransfer?.files);
		}}
	>
		<UploadIcon class="text-muted-foreground size-6" />
		<span class="text-sm font-medium">Drop images here or click to browse</span>
		<span class="text-muted-foreground text-xs">
			JPEG, PNG, WebP, AVIF or GIF · up to {formatBytes(MAX_UPLOAD_BYTES)} each
		</span>
	</button>
	<input
		bind:this={input}
		type="file"
		accept={ACCEPTED_IMAGE_TYPES.join(',')}
		multiple
		class="hidden"
		onchange={(e) => addFiles(e.currentTarget.files)}
	/>

	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-2">
			<Switch id="compress" bind:checked={compress} />
			<Label for="compress" class="text-sm font-normal">
				Compress & optimize
				<span class="text-muted-foreground">(WebP, max 2560px, metadata removed)</span>
			</Label>
		</div>
		{#if finishedCount > 0}
			<button type="button" class="text-muted-foreground hover:text-foreground text-xs" onclick={clearFinished}>
				Clear finished
			</button>
		{/if}
	</div>

	{#if queue.length > 0}
		<ul class="divide-y rounded-lg border text-sm">
			{#each queue as item (item.key)}
				<li class="flex items-center gap-3 px-3 py-2">
					{#if item.status === 'uploading'}
						<LoaderIcon class="text-muted-foreground size-4 shrink-0 animate-spin" />
					{:else if item.status === 'done'}
						<CheckIcon class="size-4 shrink-0 text-green-600" />
					{:else if item.status === 'error'}
						<CircleAlertIcon class="text-destructive size-4 shrink-0" />
					{:else}
						<span class="bg-muted size-4 shrink-0 rounded-full"></span>
					{/if}
					<span class="min-w-0 flex-1 truncate">{item.file.name}</span>
					{#if item.error}
						<span class="text-destructive max-w-[55%] text-right text-xs">{item.error}</span>
					{:else}
						<span class="text-muted-foreground text-xs">{formatBytes(item.file.size)}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

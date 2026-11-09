<!-- Edit alt text / caption / gallery settings for one image, or delete it. -->
<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { formatBytes, type MediaItem } from '#lib/media.js';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let {
		media = $bindable(),
		categories = []
	}: { media: MediaItem | null; categories?: string[] } = $props();

	let saving = $state(false);
	let error = $state<string | null>(null);
	let confirmDelete = $state(false);
	let showInGallery = $state(false);

	const open = $derived(media !== null);

	// Reset per-image form state whenever a different image is opened.
	$effect.pre(() => {
		showInGallery = media?.showInGallery ?? false;
		error = null;
	});

	function close() {
		media = null;
	}

	const submit: SubmitFunction = () => {
		saving = true;
		error = null;
		return async ({ result, update }) => {
			saving = false;
			confirmDelete = false;
			if (result.type === 'success') {
				close();
				await update();
			} else if (result.type === 'failure') {
				error = (result.data?.error as string) ?? 'Something went wrong.';
			} else {
				await update();
			}
		};
	};
</script>

<Dialog.Root {open} onOpenChange={(v) => !v && close()}>
	<Dialog.Content class="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
		{#if media}
			{#key media.id}
			<Dialog.Header>
				<Dialog.Title class="truncate pr-6">{media.filename}</Dialog.Title>
				<Dialog.Description>
					{media.width}×{media.height} · {formatBytes(media.size)} · {media.mimeType.replace('image/', '').toUpperCase()}
					{media.compressed ? '· compressed' : '· original'}
				</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
				<div class="space-y-2">
					<img
						src={media.thumbUrl}
						alt={media.alt}
						class="bg-muted aspect-square w-full rounded-lg object-contain"
					/>
					<a
						href={media.url}
						target="_blank"
						rel="noreferrer"
						class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
					>
						Open full size <ExternalLinkIcon class="size-3" />
					</a>
				</div>

				<form id="media-edit-form" method="POST" action="?/update" use:enhance={submit}>
					<input type="hidden" name="id" value={media.id} />
					<Field.Group>
						<Field.Field>
							<Field.Label for="alt">Alt text</Field.Label>
							<Input id="alt" name="alt" value={media.alt} maxlength={300} placeholder="Describe the image" />
							<Field.Description>Read by screen readers and search engines.</Field.Description>
						</Field.Field>
						<Field.Field>
							<Field.Label for="caption">Caption</Field.Label>
							<Textarea id="caption" name="caption" value={media.caption ?? ''} maxlength={500} rows={2} />
						</Field.Field>
						<Field.Field orientation="horizontal">
							<Switch id="showInGallery" name="showInGallery" value="on" bind:checked={showInGallery} />
							<Field.Label for="showInGallery" class="font-normal">Show on public Gallery page</Field.Label>
						</Field.Field>
						<Field.Field>
							<Field.Label for="galleryCategory">Gallery category</Field.Label>
							<Input
								id="galleryCategory"
								name="galleryCategory"
								value={media.galleryCategory ?? ''}
								maxlength={60}
								list="gallery-categories"
								placeholder="e.g. Gorilla Trekking"
							/>
							<datalist id="gallery-categories">
								{#each categories as category (category)}
									<option value={category}></option>
								{/each}
							</datalist>
						</Field.Field>
						{#if error}
							<Field.Error>{error}</Field.Error>
						{/if}
					</Field.Group>
				</form>
			</div>

			<Dialog.Footer class="gap-2 sm:justify-between">
				<Button variant="destructive" type="button" onclick={() => (confirmDelete = true)}>Delete</Button>
				<div class="flex gap-2">
					<Button variant="outline" type="button" onclick={close}>Cancel</Button>
					<Button type="submit" form="media-edit-form" disabled={saving}>
						{saving ? 'Saving…' : 'Save'}
					</Button>
				</div>
			</Dialog.Footer>
			{/key}
		{/if}
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={confirmDelete}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this image?</AlertDialog.Title>
			<AlertDialog.Description>
				It will be removed from storage and from anywhere it is used on the website. This can't be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form method="POST" action="?/delete" use:enhance={submit}>
				<input type="hidden" name="id" value={media?.id} />
				<button type="submit" class={buttonVariants({ variant: 'destructive' })} disabled={saving}>
					{saving ? 'Deleting…' : 'Delete'}
				</button>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

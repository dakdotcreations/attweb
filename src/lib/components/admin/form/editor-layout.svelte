<!--
	Shared shell for content edit pages: header with back link + Save/Delete,
	main column and a side column. The <form> wraps both columns.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { JsonForm } from '#lib/admin/json-form.svelte.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		backHref,
		backLabel,
		form,
		isNew,
		main,
		aside,
		danger
	}: {
		title: string;
		description?: string;
		backHref: string;
		backLabel: string;
		form: JsonForm<unknown>;
		isNew: boolean;
		main: Snippet;
		aside?: Snippet;
		/** Rendered at the bottom, outside the form (delete button). */
		danger?: Snippet;
	} = $props();
</script>

<a href={backHref} class="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm">
	<ArrowLeftIcon class="size-4" />
	{backLabel}
</a>

<PageHeader {title} {description}>
	{#snippet actions()}
		{#if form.saved}
			<span class="text-muted-foreground inline-flex items-center gap-1 text-sm">
				<CheckIcon class="size-4 text-green-600" /> Saved
			</span>
		{/if}
		<Button type="submit" form="editor-form" disabled={form.submitting}>
			{form.submitting ? 'Saving…' : isNew ? 'Create' : 'Save changes'}
		</Button>
	{/snippet}
</PageHeader>

{#if form.message}
	<div class="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-lg border px-4 py-3 text-sm" role="alert">
		{form.message}
	</div>
{/if}

<form id="editor-form" method="POST" action="?/save" use:enhance={form.enhance} novalidate>
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<div class="min-w-0 space-y-6">{@render main()}</div>
		{#if aside}
			<div class="space-y-6">{@render aside()}</div>
		{/if}
	</div>
</form>

{#if danger && !isNew}
	<div class="mt-10 flex justify-end border-t pt-6">{@render danger()}</div>
{/if}

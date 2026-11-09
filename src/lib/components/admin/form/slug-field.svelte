<!--
	URL slug that follows `source` (title/name) until the user edits it.
	Existing records start `locked` so published URLs don't change by accident.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { slugify } from '#lib/slug.js';

	let {
		value = $bindable(''),
		source,
		prefix,
		locked = false,
		error
	}: { value?: string; source: string; prefix: string; locked?: boolean; error?: string } = $props();

	// svelte-ignore state_referenced_locally
	let manual = $state(locked);

	$effect(() => {
		if (!manual) value = slugify(source);
	});
</script>

<Field.Field data-invalid={error ? true : undefined}>
	<Field.Label for="slug">URL</Field.Label>
	<div class="flex items-center gap-2">
		<span class="text-muted-foreground shrink-0 text-sm">{prefix}</span>
		<Input
			id="slug"
			bind:value
			maxlength={80}
			aria-invalid={error ? true : undefined}
			oninput={() => (manual = true)}
			onblur={() => (value = slugify(value))}
		/>
		{#if manual}
			<Button type="button" variant="ghost" size="sm" onclick={() => (manual = false)} title="Generate from title">
				Auto
			</Button>
		{/if}
	</div>
	{#if locked && manual}
		<Field.Description>Changing the URL of a published page breaks existing links to it.</Field.Description>
	{/if}
	{#if error}<Field.Error>{error}</Field.Error>{/if}
</Field.Field>

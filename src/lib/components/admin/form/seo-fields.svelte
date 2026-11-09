<script lang="ts">
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';

	let {
		title = $bindable(''),
		description = $bindable(''),
		fallbackTitle = '',
		fallbackDescription = '',
		errors = {}
	}: {
		title?: string;
		description?: string;
		fallbackTitle?: string;
		fallbackDescription?: string;
		errors?: Record<string, string>;
	} = $props();
</script>

<Field.Group>
	<Field.Field data-invalid={errors.seoTitle ? true : undefined}>
		<Field.Label for="seoTitle">SEO title</Field.Label>
		<Input id="seoTitle" bind:value={title} maxlength={70} placeholder={fallbackTitle} />
		<Field.Description>{title.length}/70 · Leave empty to use the title.</Field.Description>
		{#if errors.seoTitle}<Field.Error>{errors.seoTitle}</Field.Error>{/if}
	</Field.Field>
	<Field.Field data-invalid={errors.seoDescription ? true : undefined}>
		<Field.Label for="seoDescription">SEO description</Field.Label>
		<Textarea id="seoDescription" bind:value={description} maxlength={160} rows={2} placeholder={fallbackDescription} />
		<Field.Description>{description.length}/160 · Leave empty to use the summary.</Field.Description>
		{#if errors.seoDescription}<Field.Error>{errors.seoDescription}</Field.Error>{/if}
	</Field.Field>
</Field.Group>

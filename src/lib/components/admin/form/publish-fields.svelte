<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import type { PublishStatus } from '#lib/schemas/common.js';
	import type { Snippet } from 'svelte';

	let {
		status = $bindable('DRAFT'),
		sortOrder = $bindable(0),
		showSortOrder = true,
		errors = {},
		children
	}: {
		status?: PublishStatus;
		sortOrder?: number;
		showSortOrder?: boolean;
		errors?: Record<string, string>;
		/** Extra fields (e.g. "Featured") */
		children?: Snippet;
	} = $props();

	const labels: Record<PublishStatus, string> = { DRAFT: 'Draft (hidden)', PUBLISHED: 'Published' };
</script>

<Card.Root>
	<Card.Header><Card.Title>Publishing</Card.Title></Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="status">Status</Field.Label>
				<Select.Root type="single" bind:value={status}>
					<Select.Trigger id="status" class="w-full">{labels[status]}</Select.Trigger>
					<Select.Content>
						<Select.Item value="DRAFT" label={labels.DRAFT} />
						<Select.Item value="PUBLISHED" label={labels.PUBLISHED} />
					</Select.Content>
				</Select.Root>
			</Field.Field>
			{#if showSortOrder}
				<Field.Field data-invalid={errors.sortOrder ? true : undefined}>
					<Field.Label for="sortOrder">Display order</Field.Label>
					<Input id="sortOrder" type="number" min={0} max={9999} step={1} bind:value={sortOrder} />
					<Field.Description>Lower numbers appear first.</Field.Description>
					{#if errors.sortOrder}<Field.Error>{errors.sortOrder}</Field.Error>{/if}
				</Field.Field>
			{/if}
			{@render children?.()}
		</Field.Group>
	</Card.Content>
</Card.Root>

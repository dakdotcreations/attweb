<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import PublishFields from '#lib/components/admin/form/publish-fields.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { AirlineInput } from '#lib/schemas/airlines.js';
	import type { PublishStatus } from '#lib/schemas/common.js';

	type Airline = { id: string; name: string; status: PublishStatus; sortOrder: number };

	let { airline }: { airline: Airline | null } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const a = airline;
	let values = $state<AirlineInput>({
		name: a?.name ?? '',
		status: a?.status ?? 'PUBLISHED',
		sortOrder: a?.sortOrder ?? 0
	});

	const form = new JsonForm<AirlineInput>(() => values);
	const errors = $derived(form.errors);
</script>

<EditorLayout
	title={airline ? airline.name : 'New airline'}
	description={airline ? undefined : 'An airline visitors can choose on the flight request form.'}
	backHref="/dashboard/airlines"
	backLabel="Airlines"
	{form}
	isNew={!airline}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.name ? true : undefined}>
						<Field.Label for="name">Name</Field.Label>
						<Input id="name" bind:value={values.name} maxlength={80} placeholder="e.g. Uganda Airlines" aria-invalid={errors.name ? true : undefined} />
						<Field.Description>Shown exactly like this on the flight form and the About page.</Field.Description>
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors} />
	{/snippet}

	{#snippet danger()}
		<DeleteButton
			label="Delete airline"
			title="Delete this airline?"
			description="It will be removed from the flight form and the About page. Past flight requests keep its name."
		/>
	{/snippet}
</EditorLayout>

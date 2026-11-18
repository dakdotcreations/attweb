<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import ImageField from '#lib/components/admin/form/image-field.svelte';
	import PublishFields from '#lib/components/admin/form/publish-fields.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { MediaRef } from '#lib/media.js';
	import type { AirlineInput } from '#lib/schemas/airlines.js';
	import type { PublishStatus } from '#lib/schemas/common.js';
	import PlaneIcon from '@lucide/svelte/icons/plane';

	type Airline = { id: string; name: string; status: PublishStatus; sortOrder: number; logo: MediaRef | null };

	let { airline }: { airline: Airline | null } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const a = airline;
	let values = $state({
		name: a?.name ?? '',
		status: a?.status ?? ('PUBLISHED' as PublishStatus),
		sortOrder: a?.sortOrder ?? 0,
		logo: a?.logo ?? null
	});

	const form = new JsonForm<AirlineInput>(() => {
		const { logo, ...rest } = values;
		return { ...rest, logoId: logo?.id ?? null };
	});
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
						<Field.Label for="name"><PlaneIcon />Name</Field.Label>
						<Input id="name" bind:value={values.name} maxlength={80} placeholder="e.g. Uganda Airlines" aria-invalid={errors.name ? true : undefined} />
						<Field.Description>Shown exactly like this on the flight request form.</Field.Description>
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors} />
		<Card.Root>
			<Card.Header>
				<Card.Title>Logo</Card.Title>
				<Card.Description>Optional. Published airlines with a logo run in the About page logo strip.</Card.Description>
			</Card.Header>
			<Card.Content>
				<ImageField bind:value={values.logo} label="Logo" />
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton
			label="Delete airline"
			title="Delete this airline?"
			description="It will be removed from the flight form and the About page logo strip. Past flight requests keep its name."
		/>
	{/snippet}
</EditorLayout>

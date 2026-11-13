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
	import type { PublishStatus } from '#lib/schemas/common.js';
	import type { InstitutionInput } from '#lib/schemas/institutions.js';

	type Institution = {
		id: string;
		name: string;
		country: string;
		status: PublishStatus;
		sortOrder: number;
		logo: MediaRef | null;
		_count: { inquiries: number };
	};

	let {
		institution,
		countries,
		canViewInquiries
	}: { institution: Institution | null; countries: string[]; canViewInquiries: boolean } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const i = institution;
	let values = $state({
		name: i?.name ?? '',
		country: i?.country ?? '',
		status: i?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: i?.sortOrder ?? 0,
		logo: i?.logo ?? null
	});

	const form = new JsonForm<InstitutionInput>(() => {
		const { logo, ...rest } = values;
		return { ...rest, logoId: logo?.id ?? null };
	});
	const errors = $derived(form.errors);
</script>

<EditorLayout
	title={institution ? institution.name : 'New partner institution'}
	description={institution ? undefined : 'A university or college students can choose on the study abroad form.'}
	backHref="/dashboard/institutions"
	backLabel="Partner Institutions"
	{form}
	isNew={!institution}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.name ? true : undefined}>
						<Field.Label for="name">Name</Field.Label>
						<Input id="name" bind:value={values.name} maxlength={150} placeholder="e.g. University of Leeds" aria-invalid={errors.name ? true : undefined} />
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.country ? true : undefined}>
						<Field.Label for="country">Country</Field.Label>
						<Input
							id="country"
							bind:value={values.country}
							maxlength={80}
							list="institution-countries"
							placeholder="e.g. United Kingdom"
							aria-invalid={errors.country ? true : undefined}
						/>
						<datalist id="institution-countries">
							{#each countries as c (c)}<option value={c}></option>{/each}
						</datalist>
						<Field.Description>Students filter by country, so spell it the same way each time.</Field.Description>
						{#if errors.country}<Field.Error>{errors.country}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>

		{#if institution && institution._count.inquiries > 0}
			<p class="text-muted-foreground text-sm">
				Chosen in {institution._count.inquiries} study request{institution._count.inquiries === 1 ? '' : 's'}.
				{#if canViewInquiries}
					<a href="/dashboard/inquiries?institution={institution.id}" class="text-foreground underline underline-offset-4">View requests</a>
				{/if}
			</p>
		{/if}
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors} />
		<Card.Root>
			<Card.Header><Card.Title>Logo</Card.Title></Card.Header>
			<Card.Content>
				<ImageField bind:value={values.logo} label="Logo" />
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton
			label="Delete institution"
			title="Delete this institution?"
			description="It will be removed from the study abroad form. Past requests keep its name."
		/>
	{/snippet}
</EditorLayout>

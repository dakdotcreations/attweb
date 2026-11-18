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
	import type { MedicalPartnerInput } from '#lib/schemas/medical-partners.js';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import HospitalIcon from '@lucide/svelte/icons/hospital';

	type Partner = {
		id: string;
		name: string;
		country: string;
		status: PublishStatus;
		sortOrder: number;
		logo: MediaRef | null;
	};

	let { partner, countries }: { partner: Partner | null; countries: string[] } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const p = partner;
	let values = $state({
		name: p?.name ?? '',
		country: p?.country ?? '',
		status: p?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: p?.sortOrder ?? 0,
		logo: p?.logo ?? null
	});

	const form = new JsonForm<MedicalPartnerInput>(() => {
		const { logo, ...rest } = values;
		return { ...rest, logoId: logo?.id ?? null };
	});
	const errors = $derived(form.errors);
</script>

<EditorLayout
	title={partner ? partner.name : 'New medical partner'}
	description={partner ? undefined : 'A hospital, clinic or medical institution visitors can choose on the medical tourism form.'}
	backHref="/dashboard/medical-partners"
	backLabel="Medical Partners"
	{form}
	isNew={!partner}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.name ? true : undefined}>
						<Field.Label for="name"><HospitalIcon />Name</Field.Label>
						<Input
							id="name"
							bind:value={values.name}
							maxlength={150}
							placeholder="e.g. JD Max Health Care India"
							aria-invalid={errors.name ? true : undefined}
						/>
						<Field.Description>Only list hospitals Altura has a written partnership with.</Field.Description>
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.country ? true : undefined}>
						<Field.Label for="country"><GlobeIcon />Country</Field.Label>
						<Input
							id="country"
							bind:value={values.country}
							maxlength={80}
							list="medical-partner-countries"
							placeholder="e.g. India"
							aria-invalid={errors.country ? true : undefined}
						/>
						<datalist id="medical-partner-countries">
							{#each countries as c (c)}<option value={c}></option>{/each}
						</datalist>
						<Field.Description>Visitors filter by country, so spell it the same way each time.</Field.Description>
						{#if errors.country}<Field.Error>{errors.country}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>
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
			label="Delete partner"
			title="Delete this medical partner?"
			description="It will be removed from the medical tourism form. Past requests keep its name."
		/>
	{/snippet}
</EditorLayout>

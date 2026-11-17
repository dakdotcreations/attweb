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
	import type { TeamMemberInput } from '#lib/schemas/team.js';

	type Member = {
		id: string;
		name: string;
		role: string;
		whatsapp: string | null;
		status: PublishStatus;
		sortOrder: number;
		photo: MediaRef | null;
	};

	let { member }: { member: Member | null } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const m = member;
	let values = $state({
		name: m?.name ?? '',
		role: m?.role ?? '',
		whatsapp: m?.whatsapp ?? '',
		status: m?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: m?.sortOrder ?? 0,
		photo: m?.photo ?? null
	});

	const form = new JsonForm<TeamMemberInput>(() => {
		const { photo, ...rest } = values;
		return { ...rest, photoId: photo?.id ?? null };
	});
	const errors = $derived(form.errors);
</script>

<EditorLayout
	title={member ? member.name : 'New team member'}
	description={member ? undefined : 'Someone clients will meet or message, shown on the About page.'}
	backHref="/dashboard/team"
	backLabel="Team"
	{form}
	isNew={!member}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.name ? true : undefined}>
						<Field.Label for="name">Name</Field.Label>
						<Input id="name" bind:value={values.name} maxlength={80} aria-invalid={errors.name ? true : undefined} />
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.role ? true : undefined}>
						<Field.Label for="role">Role</Field.Label>
						<Input id="role" bind:value={values.role} maxlength={80} placeholder="e.g. Safari planner, or Visas & Study Abroad" aria-invalid={errors.role ? true : undefined} />
						{#if errors.role}<Field.Error>{errors.role}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.whatsapp ? true : undefined}>
						<Field.Label for="whatsapp">WhatsApp number (optional)</Field.Label>
						<Input id="whatsapp" type="tel" bind:value={values.whatsapp} maxlength={30} placeholder="+256 700 000000" aria-invalid={errors.whatsapp ? true : undefined} />
						<Field.Description>Used for the "Message on WhatsApp" link. Leave empty to use the company number from Settings.</Field.Description>
						{#if errors.whatsapp}<Field.Error>{errors.whatsapp}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors} />
		<Card.Root>
			<Card.Header>
				<Card.Title>Photo</Card.Title>
				<Card.Description>A portrait, shown at 4:5. Members without a photo are not shown on the site.</Card.Description>
			</Card.Header>
			<Card.Content>
				<ImageField bind:value={values.photo} label="Photo" />
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton label="Delete team member" title="Delete this team member?" description="They will be removed from the About page." />
	{/snippet}
</EditorLayout>

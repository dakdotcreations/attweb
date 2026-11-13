<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import ImageField from '#lib/components/admin/form/image-field.svelte';
	import PublishFields from '#lib/components/admin/form/publish-fields.svelte';
	import RichTextEditor from '#lib/components/admin/form/rich-text-editor.svelte';
	import SeoFields from '#lib/components/admin/form/seo-fields.svelte';
	import SlugField from '#lib/components/admin/form/slug-field.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { SERVICE_FORM_TYPES, formTypeLabels, type ServiceFormType } from '#lib/inquiries.js';
	import type { MediaRef } from '#lib/media.js';
	import type { PublishStatus } from '#lib/schemas/common.js';
	import type { ServiceInput } from '#lib/schemas/services.js';

	type Service = {
		id: string;
		name: string;
		slug: string;
		summary: string;
		content: string;
		status: PublishStatus;
		sortOrder: number;
		formType: ServiceFormType;
		seoTitle: string | null;
		seoDescription: string | null;
		coverImage: MediaRef | null;
	};

	let {
		service,
		publishedInstitutions
	}: { service: Service | null; /** Published partner institutions (the study form needs at least one) */ publishedInstitutions: number } = $props();

	// Initial values only; the {#key} in the page recreates this component per record.
	// svelte-ignore state_referenced_locally
	const s = service;
	let values = $state({
		name: s?.name ?? '',
		slug: s?.slug ?? '',
		summary: s?.summary ?? '',
		content: s?.content ?? '',
		status: s?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: s?.sortOrder ?? 0,
		formType: s?.formType ?? ('GENERAL' as ServiceFormType),
		seoTitle: s?.seoTitle ?? '',
		seoDescription: s?.seoDescription ?? '',
		coverImage: s?.coverImage ?? null
	});

	const form = new JsonForm<ServiceInput>(() => {
		const { coverImage, ...rest } = values;
		return { ...rest, coverImageId: coverImage?.id ?? null };
	});
	const errors = $derived(form.errors);
</script>

<EditorLayout
	title={service ? service.name : 'New service'}
	description={service ? undefined : 'Add a business line, e.g. Gorilla Trekking or Visa Assistance.'}
	backHref="/dashboard/services"
	backLabel="Services"
	{form}
	isNew={!service}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.name ? true : undefined}>
						<Field.Label for="name">Name</Field.Label>
						<Input id="name" bind:value={values.name} maxlength={120} aria-invalid={errors.name ? true : undefined} />
						{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
					</Field.Field>
					<SlugField bind:value={values.slug} source={values.name} prefix="/services/" locked={!!service} error={errors.slug} />
					<Field.Field data-invalid={errors.summary ? true : undefined}>
						<Field.Label for="summary">Summary</Field.Label>
						<Textarea id="summary" bind:value={values.summary} maxlength={300} rows={2} />
						<Field.Description>One or two sentences for cards and search results.</Field.Description>
						{#if errors.summary}<Field.Error>{errors.summary}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.content ? true : undefined}>
						<Field.Label>Page content</Field.Label>
						<RichTextEditor bind:value={values.content} invalid={!!errors.content} />
						{#if errors.content}<Field.Error>{errors.content}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Search engines</Card.Title></Card.Header>
			<Card.Content>
				<SeoFields
					bind:title={values.seoTitle}
					bind:description={values.seoDescription}
					fallbackTitle={values.name}
					fallbackDescription={values.summary}
					{errors}
				/>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors} />
		<Card.Root>
			<Card.Header>
				<Card.Title>Request form</Card.Title>
				<Card.Description>The form visitors fill in on this service's page. Submissions arrive in Inquiries.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Field.Field data-invalid={errors.formType ? true : undefined}>
					<Field.Label for="formType" class="sr-only">Request form</Field.Label>
					<Select.Root type="single" bind:value={values.formType}>
						<Select.Trigger id="formType" class="w-full">{formTypeLabels[values.formType]}</Select.Trigger>
						<Select.Content>
							{#each SERVICE_FORM_TYPES as t (t)}<Select.Item value={t} label={formTypeLabels[t]} />{/each}
						</Select.Content>
					</Select.Root>
					{#if values.formType === 'FLIGHT'}
						<Field.Description>Route, dates, passengers, cabin and airline preferences.</Field.Description>
					{:else if values.formType === 'STUDY_ABROAD'}
						<Field.Description>
							Students choose up to 3 <a href="/dashboard/institutions" class="underline underline-offset-4">partner institutions</a>,
							their level, course and intake.
						</Field.Description>
						{#if publishedInstitutions === 0}
							<p class="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200" role="status">
								<strong>Not showing yet.</strong> No partner institution is published, so this page shows the general inquiry form for now.
								<a href="/dashboard/institutions" class="font-medium underline underline-offset-4">Publish an institution</a> to switch it on.
							</p>
						{/if}
					{:else}
						<Field.Description>Name, contact details, travel date, group size and a message.</Field.Description>
					{/if}
					{#if errors.formType}<Field.Error>{errors.formType}</Field.Error>{/if}
				</Field.Field>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header><Card.Title>Cover image</Card.Title></Card.Header>
			<Card.Content>
				<ImageField bind:value={values.coverImage} label="Cover image" />
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton
			label="Delete service"
			title="Delete this service?"
			description="It will be removed from the website and untagged from all packages. Packages themselves are kept."
		/>
	{/snippet}
</EditorLayout>

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
	import { Textarea } from '#lib/components/ui/textarea/index.js';
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
		seoTitle: string | null;
		seoDescription: string | null;
		coverImage: MediaRef | null;
	};

	let { service }: { service: Service | null } = $props();

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

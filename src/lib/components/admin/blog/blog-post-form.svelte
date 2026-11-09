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
	import { formatDate } from '#lib/format.js';
	import type { MediaRef } from '#lib/media.js';
	import type { BlogPostInput } from '#lib/schemas/blog.js';
	import type { PublishStatus } from '#lib/schemas/common.js';

	type Post = {
		id: string;
		title: string;
		slug: string;
		excerpt: string;
		content: string;
		status: PublishStatus;
		serviceId: string | null;
		publishedAt: Date | null;
		seoTitle: string | null;
		seoDescription: string | null;
		coverImage: MediaRef | null;
		author: { name: string; email: string } | null;
	};

	let {
		post,
		services
	}: { post: Post | null; services: { id: string; name: string }[] } = $props();

	// svelte-ignore state_referenced_locally
	const p = post;
	let values = $state({
		title: p?.title ?? '',
		slug: p?.slug ?? '',
		excerpt: p?.excerpt ?? '',
		content: p?.content ?? '',
		status: p?.status ?? ('DRAFT' as PublishStatus),
		// Select needs a string; '' means "none".
		serviceId: p?.serviceId ?? '',
		seoTitle: p?.seoTitle ?? '',
		seoDescription: p?.seoDescription ?? '',
		coverImage: p?.coverImage ?? null
	});

	const form = new JsonForm<BlogPostInput>(() => {
		const { coverImage, serviceId, ...rest } = values;
		return { ...rest, serviceId: serviceId || null, coverImageId: coverImage?.id ?? null };
	});
	const errors = $derived(form.errors);
	const serviceLabel = $derived(services.find((s) => s.id === values.serviceId)?.name ?? 'None');
</script>

<EditorLayout title={post ? post.title : 'New blog post'} backHref="/dashboard/blog" backLabel="Blog" {form} isNew={!post}>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.title ? true : undefined}>
						<Field.Label for="title">Title</Field.Label>
						<Input id="title" bind:value={values.title} maxlength={150} aria-invalid={errors.title ? true : undefined} />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<SlugField bind:value={values.slug} source={values.title} prefix="/blog/" locked={!!post} error={errors.slug} />
					<Field.Field data-invalid={errors.excerpt ? true : undefined}>
						<Field.Label for="excerpt">Excerpt</Field.Label>
						<Textarea id="excerpt" bind:value={values.excerpt} maxlength={300} rows={2} />
						<Field.Description>Short teaser for the blog list and search results.</Field.Description>
						{#if errors.excerpt}<Field.Error>{errors.excerpt}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.content ? true : undefined}>
						<Field.Label>Content</Field.Label>
						<RichTextEditor bind:value={values.content} invalid={!!errors.content} minHeight="28rem" />
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
					fallbackTitle={values.title}
					fallbackDescription={values.excerpt}
					{errors}
				/>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} showSortOrder={false} {errors}>
			{#if post?.publishedAt}
				<p class="text-muted-foreground text-sm">First published {formatDate(post.publishedAt)}</p>
			{/if}
			{#if post?.author}
				<p class="text-muted-foreground text-sm">By {post.author.name || post.author.email}</p>
			{/if}
		</PublishFields>

		<Card.Root>
			<Card.Header><Card.Title>Cover image</Card.Title></Card.Header>
			<Card.Content>
				<ImageField bind:value={values.coverImage} label="Cover image" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Related service</Card.Title>
				<Card.Description>Lists this post on the service's page.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Select.Root type="single" bind:value={values.serviceId}>
					<Select.Trigger class="w-full">{serviceLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="None" />
						{#each services as service (service.id)}
							<Select.Item value={service.id} label={service.name} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton label="Delete post" title="Delete this post?" description="The post is removed from the website permanently." />
	{/snippet}
</EditorLayout>

<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import ImageField from '#lib/components/admin/form/image-field.svelte';
	import PublishFields from '#lib/components/admin/form/publish-fields.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import type { MediaRef } from '#lib/media.js';
	import type { PublishStatus } from '#lib/schemas/common.js';
	import type { TestimonialInput } from '#lib/schemas/testimonials.js';

	type Testimonial = {
		id: string;
		name: string;
		location: string | null;
		quote: string;
		rating: number | null;
		serviceId: string | null;
		packageId: string | null;
		featured: boolean;
		status: PublishStatus;
		sortOrder: number;
		photo: MediaRef | null;
	};

	let {
		testimonial,
		services,
		packages
	}: {
		testimonial: Testimonial | null;
		services: { id: string; name: string }[];
		packages: { id: string; title: string }[];
	} = $props();

	// svelte-ignore state_referenced_locally
	const t = testimonial;
	let values = $state({
		name: t?.name ?? '',
		location: t?.location ?? '',
		quote: t?.quote ?? '',
		// Selects work with strings; '' means "none".
		rating: t?.rating ? String(t.rating) : '',
		serviceId: t?.serviceId ?? '',
		packageId: t?.packageId ?? '',
		featured: t?.featured ?? false,
		status: t?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: t?.sortOrder ?? 0,
		photo: t?.photo ?? null
	});

	const form = new JsonForm<TestimonialInput>(() => {
		const { photo, rating, serviceId, packageId, ...rest } = values;
		return {
			...rest,
			rating: rating ? Number(rating) : null,
			serviceId: serviceId || null,
			packageId: packageId || null,
			photoId: photo?.id ?? null
		};
	});
	const errors = $derived(form.errors);

	const ratingLabel = $derived(values.rating ? '★'.repeat(Number(values.rating)) : 'No rating');
	const serviceLabel = $derived(services.find((s) => s.id === values.serviceId)?.name ?? 'None');
	const packageLabel = $derived(packages.find((p) => p.id === values.packageId)?.title ?? 'None');
</script>

<EditorLayout
	title={testimonial ? testimonial.name : 'New testimonial'}
	backHref="/dashboard/testimonials"
	backLabel="Testimonials"
	{form}
	isNew={!testimonial}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field data-invalid={errors.name ? true : undefined}>
							<Field.Label for="name">Customer name</Field.Label>
							<Input id="name" bind:value={values.name} maxlength={120} aria-invalid={errors.name ? true : undefined} />
							{#if errors.name}<Field.Error>{errors.name}</Field.Error>{/if}
						</Field.Field>
						<Field.Field data-invalid={errors.location ? true : undefined}>
							<Field.Label for="location">From</Field.Label>
							<Input id="location" bind:value={values.location} maxlength={120} placeholder="e.g. Germany" />
							{#if errors.location}<Field.Error>{errors.location}</Field.Error>{/if}
						</Field.Field>
					</div>
					<Field.Field data-invalid={errors.quote ? true : undefined}>
						<Field.Label for="quote">Quote</Field.Label>
						<Textarea id="quote" bind:value={values.quote} maxlength={2000} rows={6} aria-invalid={errors.quote ? true : undefined} />
						{#if errors.quote}<Field.Error>{errors.quote}</Field.Error>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="rating">Rating</Field.Label>
						<Select.Root type="single" bind:value={values.rating}>
							<Select.Trigger id="rating" class="w-48">{ratingLabel}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="No rating" />
								{#each [5, 4, 3, 2, 1] as n (n)}
									<Select.Item value={String(n)} label={'★'.repeat(n)} />
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Related to</Card.Title>
				<Card.Description>Shows this testimonial on the matching service or package page.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-4 sm:grid-cols-2">
					<Field.Field>
						<Field.Label>Service</Field.Label>
						<Select.Root type="single" bind:value={values.serviceId}>
							<Select.Trigger class="w-full">{serviceLabel}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="None" />
								{#each services as s (s.id)}<Select.Item value={s.id} label={s.name} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label>Tour package</Field.Label>
						<Select.Root type="single" bind:value={values.packageId}>
							<Select.Trigger class="w-full">{packageLabel}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="None" />
								{#each packages as p (p.id)}<Select.Item value={p.id} label={p.title} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet aside()}
		<PublishFields bind:status={values.status} bind:sortOrder={values.sortOrder} {errors}>
			<Field.Field orientation="horizontal">
				<Switch id="featured" bind:checked={values.featured} />
				<Field.Label for="featured" class="font-normal">Feature on homepage</Field.Label>
			</Field.Field>
		</PublishFields>
		<Card.Root>
			<Card.Header><Card.Title>Photo</Card.Title></Card.Header>
			<Card.Content>
				<ImageField bind:value={values.photo} label="Photo" />
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton label="Delete testimonial" title="Delete this testimonial?" description="It will be removed from the website." />
	{/snippet}
</EditorLayout>

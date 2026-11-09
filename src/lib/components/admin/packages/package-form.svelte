<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import GalleryField from '#lib/components/admin/form/gallery-field.svelte';
	import ImageField from '#lib/components/admin/form/image-field.svelte';
	import PublishFields from '#lib/components/admin/form/publish-fields.svelte';
	import RichTextEditor from '#lib/components/admin/form/rich-text-editor.svelte';
	import SeoFields from '#lib/components/admin/form/seo-fields.svelte';
	import SlugField from '#lib/components/admin/form/slug-field.svelte';
	import TextListField from '#lib/components/admin/form/text-list-field.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import type { MediaRef } from '#lib/media.js';
	import type { PublishStatus } from '#lib/schemas/common.js';
	import type { PackageInput, PackagePriceInput } from '#lib/schemas/packages.js';
	import PriceTiersField from './price-tiers-field.svelte';

	type Pkg = {
		id: string;
		title: string;
		slug: string;
		summary: string;
		description: string;
		durationDays: number;
		durationNights: number | null;
		location: string | null;
		featured: boolean;
		status: PublishStatus;
		sortOrder: number;
		seoTitle: string | null;
		seoDescription: string | null;
		coverImage: MediaRef | null;
		serviceIds: string[];
		prices: PackagePriceInput[];
		highlights: string[];
		inclusions: string[];
		exclusions: string[];
		gallery: MediaRef[];
	};

	let {
		pkg,
		services
	}: { pkg: Pkg | null; services: { id: string; name: string; status: PublishStatus }[] } = $props();

	// svelte-ignore state_referenced_locally
	const p = pkg;
	let values = $state({
		title: p?.title ?? '',
		slug: p?.slug ?? '',
		summary: p?.summary ?? '',
		description: p?.description ?? '',
		durationDays: p?.durationDays ?? 1,
		durationNights: p?.durationNights ?? null,
		location: p?.location ?? '',
		featured: p?.featured ?? false,
		status: p?.status ?? ('DRAFT' as PublishStatus),
		sortOrder: p?.sortOrder ?? 0,
		seoTitle: p?.seoTitle ?? '',
		seoDescription: p?.seoDescription ?? '',
		coverImage: p?.coverImage ?? null,
		serviceIds: p?.serviceIds ?? [],
		prices: (p?.prices ?? []).map(({ label, amountUGX, amountUSD, isFromPrice }) => ({
			label,
			amountUGX,
			amountUSD,
			isFromPrice
		})),
		highlights: p?.highlights ?? [],
		inclusions: p?.inclusions ?? [],
		exclusions: p?.exclusions ?? [],
		gallery: p?.gallery ?? []
	});

	const form = new JsonForm<PackageInput>(() => {
		const { coverImage, gallery, ...rest } = values;
		return { ...rest, coverImageId: coverImage?.id ?? null, galleryIds: gallery.map((g) => g.id) };
	});
	const errors = $derived(form.errors);

	/** Errors for one bullet list, keyed by row index. */
	function listErrors(prefix: string) {
		const out: Record<number, string> = {};
		for (const [key, message] of Object.entries(errors)) {
			const match = key.match(new RegExp(`^${prefix}\\.(\\d+)$`));
			if (match) out[Number(match[1])] = message;
		}
		return out;
	}

	function toggleService(id: string, checked: boolean) {
		values.serviceIds = checked
			? [...values.serviceIds, id]
			: values.serviceIds.filter((s) => s !== id);
	}
</script>

<EditorLayout
	title={pkg ? pkg.title : 'New tour package'}
	backHref="/dashboard/packages"
	backLabel="Tour packages"
	{form}
	isNew={!pkg}
>
	{#snippet main()}
		<Card.Root>
			<Card.Content>
				<Field.Group>
					<Field.Field data-invalid={errors.title ? true : undefined}>
						<Field.Label for="title">Title</Field.Label>
						<Input id="title" bind:value={values.title} maxlength={150} aria-invalid={errors.title ? true : undefined} />
						{#if errors.title}<Field.Error>{errors.title}</Field.Error>{/if}
					</Field.Field>
					<SlugField bind:value={values.slug} source={values.title} prefix="/tours/" locked={!!pkg} error={errors.slug} />
					<Field.Field data-invalid={errors.summary ? true : undefined}>
						<Field.Label for="summary">Summary</Field.Label>
						<Textarea id="summary" bind:value={values.summary} maxlength={300} rows={2} />
						<Field.Description>Shown on package cards and in search results.</Field.Description>
						{#if errors.summary}<Field.Error>{errors.summary}</Field.Error>{/if}
					</Field.Field>
					<div class="grid gap-4 sm:grid-cols-3">
						<Field.Field data-invalid={errors.durationDays ? true : undefined}>
							<Field.Label for="durationDays">Days</Field.Label>
							<Input id="durationDays" type="number" min={1} max={365} bind:value={values.durationDays} />
							{#if errors.durationDays}<Field.Error>{errors.durationDays}</Field.Error>{/if}
						</Field.Field>
						<Field.Field data-invalid={errors.durationNights ? true : undefined}>
							<Field.Label for="durationNights">Nights</Field.Label>
							<Input id="durationNights" type="number" min={0} max={365} bind:value={values.durationNights} placeholder="Optional" />
							{#if errors.durationNights}<Field.Error>{errors.durationNights}</Field.Error>{/if}
						</Field.Field>
						<Field.Field data-invalid={errors.location ? true : undefined}>
							<Field.Label for="location">Location</Field.Label>
							<Input id="location" bind:value={values.location} maxlength={120} placeholder="e.g. Bwindi" />
							{#if errors.location}<Field.Error>{errors.location}</Field.Error>{/if}
						</Field.Field>
					</div>
					<Field.Field data-invalid={errors.description ? true : undefined}>
						<Field.Label>Overview</Field.Label>
						<RichTextEditor bind:value={values.description} invalid={!!errors.description} />
						<Field.Description>Describe the experience. Keep it to an overview, not a day-by-day itinerary.</Field.Description>
						{#if errors.description}<Field.Error>{errors.description}</Field.Error>{/if}
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Pricing</Card.Title>
				<Card.Description>Enter UGX and/or USD for each tier. Visitors see the currency for their location.</Card.Description>
			</Card.Header>
			<Card.Content>
				<PriceTiersField bind:value={values.prices} {errors} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Highlights</Card.Title></Card.Header>
			<Card.Content>
				<TextListField
					bind:value={values.highlights}
					placeholder="e.g. Track mountain gorillas with expert guides"
					addLabel="Add highlight"
					errors={listErrors('highlights')}
				/>
			</Card.Content>
		</Card.Root>

		<div class="grid gap-6 xl:grid-cols-2">
			<Card.Root>
				<Card.Header><Card.Title>Included</Card.Title></Card.Header>
				<Card.Content>
					<TextListField
						bind:value={values.inclusions}
						placeholder="e.g. Gorilla permit"
						addLabel="Add inclusion"
						errors={listErrors('inclusions')}
					/>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title>Not included</Card.Title></Card.Header>
				<Card.Content>
					<TextListField
						bind:value={values.exclusions}
						placeholder="e.g. International flights"
						addLabel="Add exclusion"
						errors={listErrors('exclusions')}
					/>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Gallery</Card.Title>
				<Card.Description>Shown on the package page in this order.</Card.Description>
			</Card.Header>
			<Card.Content>
				<GalleryField bind:value={values.gallery} />
				{#if errors.galleryIds}<p class="text-destructive mt-2 text-sm">{errors.galleryIds}</p>{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Search engines</Card.Title></Card.Header>
			<Card.Content>
				<SeoFields
					bind:title={values.seoTitle}
					bind:description={values.seoDescription}
					fallbackTitle={values.title}
					fallbackDescription={values.summary}
					{errors}
				/>
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
			<Card.Header><Card.Title>Cover image</Card.Title></Card.Header>
			<Card.Content>
				<ImageField bind:value={values.coverImage} label="Cover image" />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Services</Card.Title>
				<Card.Description>Tag the categories this package belongs to.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if services.length === 0}
					<p class="text-muted-foreground text-sm">
						No services yet. <a href="/dashboard/services/new" class="underline">Create one</a>.
					</p>
				{:else}
					<div class="space-y-2.5">
						{#each services as service (service.id)}
							<div class="flex items-center gap-2">
								<Checkbox
									id="service-{service.id}"
									checked={values.serviceIds.includes(service.id)}
									onCheckedChange={(checked) => toggleService(service.id, checked === true)}
								/>
								<Label for="service-{service.id}" class="font-normal">
									{service.name}
									{#if service.status === 'DRAFT'}<span class="text-muted-foreground text-xs">(draft)</span>{/if}
								</Label>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/snippet}

	{#snippet danger()}
		<DeleteButton
			label="Delete package"
			title="Delete this package?"
			description="Its prices, highlights and gallery links are removed. Gallery images stay in the media library."
		/>
	{/snippet}
</EditorLayout>

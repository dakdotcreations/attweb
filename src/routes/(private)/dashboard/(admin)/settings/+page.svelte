<script lang="ts">
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import EditorLayout from '#lib/components/admin/form/editor-layout.svelte';
	import ImageField from '#lib/components/admin/form/image-field.svelte';
	import SeoFields from '#lib/components/admin/form/seo-fields.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import type { SettingsInput } from '#lib/schemas/settings.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const s = data.settings;
	let values = $state({
		companyName: s.companyName,
		tagline: s.tagline ?? '',
		email: s.email ?? '',
		inquiryEmail: s.inquiryEmail ?? '',
		phone: s.phone ?? '',
		whatsappNumber: s.whatsappNumber ?? '',
		address: s.address ?? '',
		officeHours: s.officeHours ?? '',
		facebookUrl: s.facebookUrl ?? '',
		instagramUrl: s.instagramUrl ?? '',
		tiktokUrl: s.tiktokUrl ?? '',
		youtubeUrl: s.youtubeUrl ?? '',
		linkedinUrl: s.linkedinUrl ?? '',
		tripadvisorUrl: s.tripadvisorUrl ?? '',
		seoTitle: s.seoTitle ?? '',
		seoDescription: s.seoDescription ?? '',
		ogImage: s.ogImage ?? null
	});

	const form = new JsonForm<SettingsInput>(() => {
		const { ogImage, ...rest } = values;
		return { ...rest, ogImageId: ogImage?.id ?? null };
	});
	const errors = $derived(form.errors);

	type TextKey = Exclude<keyof typeof values, 'ogImage'>;
	const socials: { key: TextKey; label: string; placeholder: string }[] = [
		{ key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/…' },
		{ key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/…' },
		{ key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
		{ key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
		{ key: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…' },
		{ key: 'tripadvisorUrl', label: 'Tripadvisor', placeholder: 'https://tripadvisor.com/…' }
	];
</script>

{#snippet text(key: TextKey, label: string, opts: { type?: string; placeholder?: string; description?: string; max?: number } = {})}
	<Field.Field data-invalid={errors[key] ? true : undefined}>
		<Field.Label for={key}>{label}</Field.Label>
		<Input
			id={key}
			type={opts.type ?? 'text'}
			bind:value={values[key]}
			placeholder={opts.placeholder}
			maxlength={opts.max ?? 300}
			aria-invalid={errors[key] ? true : undefined}
		/>
		{#if opts.description}<Field.Description>{opts.description}</Field.Description>{/if}
		{#if errors[key]}<Field.Error>{errors[key]}</Field.Error>{/if}
	</Field.Field>
{/snippet}

<EditorLayout
	title="Settings"
	description="Contact details and links used across the website."
	backHref="/dashboard"
	backLabel="Dashboard"
	{form}
	isNew={false}
>
	{#snippet main()}
		<Card.Root>
			<Card.Header><Card.Title>Business</Card.Title></Card.Header>
			<Card.Content>
				<Field.Group>
					{@render text('companyName', 'Company name', { max: 120 })}
					{@render text('tagline', 'Tagline', { max: 160, placeholder: 'e.g. Unforgettable journeys across Uganda' })}
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Contact</Card.Title>
				<Card.Description>Customers mostly reach Altura on WhatsApp and email, so keep these current.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Field.Group>
					<div class="grid gap-4 sm:grid-cols-2">
						{@render text('whatsappNumber', 'WhatsApp number', {
							type: 'tel',
							placeholder: '+256 700 000000',
							description: 'Used for the WhatsApp buttons on the website.'
						})}
						{@render text('phone', 'Phone', { type: 'tel', max: 40 })}
						{@render text('email', 'Public email', { type: 'email', placeholder: 'info@…' })}
						{@render text('inquiryEmail', 'Inquiry notifications email', {
							type: 'email',
							description: 'Where new website inquiries are sent. Defaults to the public email.'
						})}
					</div>
					<Field.Field data-invalid={errors.address ? true : undefined}>
						<Field.Label for="address">Office address</Field.Label>
						<Textarea id="address" bind:value={values.address} maxlength={300} rows={2} />
						{#if errors.address}<Field.Error>{errors.address}</Field.Error>{/if}
					</Field.Field>
					{@render text('officeHours', 'Office hours', { max: 200, placeholder: 'Mon–Sat, 8:00–18:00 EAT' })}
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Social media</Card.Title></Card.Header>
			<Card.Content>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each socials as social (social.key)}
						{@render text(social.key, social.label, { type: 'url', placeholder: social.placeholder })}
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Search engines & sharing</Card.Title>
				<Card.Description>Defaults for pages that don't set their own.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<SeoFields bind:title={values.seoTitle} bind:description={values.seoDescription} fallbackTitle={values.companyName} {errors} />
				<Field.Field>
					<Field.Label>Sharing image</Field.Label>
					<ImageField bind:value={values.ogImage} label="Sharing image" />
					<Field.Description>Shown when links are shared on WhatsApp, Facebook, etc. Landscape works best.</Field.Description>
				</Field.Field>
			</Card.Content>
		</Card.Root>
	{/snippet}
</EditorLayout>

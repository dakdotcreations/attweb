<!-- Staff form to log a new inquiry or edit an existing one's details. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { JsonForm } from '#lib/admin/json-form.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { toDateInputValue } from '#lib/format.js';
	import {
		CONTACT_CHANNELS,
		INQUIRY_SOURCES,
		channelLabels,
		sourceLabels,
		type ContactChannel,
		type InquirySource
	} from '#lib/inquiries.js';
	import type { InquiryDetailsInput } from '#lib/schemas/inquiries.js';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import PackageIcon from '@lucide/svelte/icons/package';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import UserIcon from '@lucide/svelte/icons/user';
	import UsersIcon from '@lucide/svelte/icons/users';
	import type { Component } from 'svelte';

	type Inquiry = {
		name: string;
		email: string | null;
		phone: string | null;
		country: string | null;
		message: string;
		interest: string | null;
		packageId: string | null;
		serviceId: string | null;
		travelDate: Date | null;
		groupSize: number | null;
		preferredContact: ContactChannel | null;
		currency: 'UGX' | 'USD' | null;
		source: InquirySource;
	};

	let {
		inquiry,
		services,
		packages,
		onCancel,
		onSaved
	}: {
		inquiry: Inquiry | null;
		services: { id: string; name: string }[];
		packages: { id: string; title: string }[];
		onCancel?: () => void;
		onSaved?: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	const i = inquiry;
	// Selects use '' for "none".
	let values = $state({
		name: i?.name ?? '',
		email: i?.email ?? '',
		phone: i?.phone ?? '',
		country: i?.country ?? '',
		message: i?.message ?? '',
		interest: i?.interest ?? '',
		packageId: i?.packageId ?? '',
		serviceId: i?.serviceId ?? '',
		travelDate: toDateInputValue(i?.travelDate),
		groupSize: i?.groupSize ?? null,
		preferredContact: (i?.preferredContact ?? '') as ContactChannel | '',
		currency: (i?.currency ?? '') as 'UGX' | 'USD' | '',
		source: i?.source ?? ('WHATSAPP' as InquirySource)
	});

	const form = new JsonForm<InquiryDetailsInput>(() => ({
		...values,
		packageId: values.packageId || null,
		serviceId: values.serviceId || null,
		preferredContact: values.preferredContact || null,
		currency: values.currency || null
	}));
	const errors = $derived(form.errors);

	$effect(() => {
		if (form.saved) onSaved?.();
	});

	const packageLabel = $derived(packages.find((p) => p.id === values.packageId)?.title ?? 'None');
	const serviceLabel = $derived(services.find((s) => s.id === values.serviceId)?.name ?? 'None');
</script>

{#snippet text(key: 'name' | 'email' | 'phone' | 'country' | 'interest', label: string, Icon: Component, opts: { type?: string; placeholder?: string; max?: number } = {})}
	<Field.Field data-invalid={errors[key] ? true : undefined}>
		<Field.Label for="inq-{key}"><Icon />{label}</Field.Label>
		<Input
			id="inq-{key}"
			type={opts.type ?? 'text'}
			bind:value={values[key]}
			placeholder={opts.placeholder}
			maxlength={opts.max ?? 120}
			aria-invalid={errors[key] ? true : undefined}
		/>
		{#if errors[key]}<Field.Error>{errors[key]}</Field.Error>{/if}
	</Field.Field>
{/snippet}

<form method="POST" action="?/save" use:enhance={form.enhance} novalidate>
	<Card.Root>
		<Card.Content>
			<Field.Group>
				{#if form.message}
					<p class="text-destructive text-sm" role="alert">{form.message}</p>
				{/if}
				<div class="grid gap-4 sm:grid-cols-2">
					{@render text('name', 'Name', UserIcon)}
					<Field.Field>
						<Field.Label for="inq-source"><InboxIcon />How did they contact us?</Field.Label>
						<Select.Root type="single" bind:value={values.source}>
							<Select.Trigger id="inq-source" class="w-full">{sourceLabels[values.source]}</Select.Trigger>
							<Select.Content>
								{#each INQUIRY_SOURCES as s (s)}<Select.Item value={s} label={sourceLabels[s]} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					{@render text('phone', 'Phone / WhatsApp', PhoneIcon, { type: 'tel', placeholder: '+256 700 000000', max: 40 })}
					{@render text('email', 'Email', MailIcon, { type: 'email', max: 200 })}
					{@render text('country', 'Country', GlobeIcon, { max: 80 })}
					<Field.Field>
						<Field.Label for="inq-channel"><MessageCircleIcon />Prefers to be contacted by</Field.Label>
						<Select.Root type="single" bind:value={values.preferredContact}>
							<Select.Trigger id="inq-channel" class="w-full">
								{values.preferredContact ? channelLabels[values.preferredContact] : 'No preference'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="No preference" />
								{#each CONTACT_CHANNELS as c (c)}<Select.Item value={c} label={channelLabels[c]} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<Field.Field>
						<Field.Label><PackageIcon />Tour package</Field.Label>
						<Select.Root type="single" bind:value={values.packageId}>
							<Select.Trigger class="w-full">{packageLabel}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="None" />
								{#each packages as p (p.id)}<Select.Item value={p.id} label={p.title} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label><BriefcaseIcon />Service</Field.Label>
						<Select.Root type="single" bind:value={values.serviceId}>
							<Select.Trigger class="w-full">{serviceLabel}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="None" />
								{#each services as s (s.id)}<Select.Item value={s.id} label={s.name} />{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>
				{@render text('interest', 'Interested in', CompassIcon, { placeholder: 'Filled from the package/service if left empty', max: 200 })}

				<div class="grid gap-4 sm:grid-cols-3">
					<Field.Field data-invalid={errors.travelDate ? true : undefined}>
						<Field.Label for="inq-date"><CalendarIcon />Travel date</Field.Label>
						<Input id="inq-date" type="date" bind:value={values.travelDate} />
						{#if errors.travelDate}<Field.Error>{errors.travelDate}</Field.Error>{/if}
					</Field.Field>
					<Field.Field data-invalid={errors.groupSize ? true : undefined}>
						<Field.Label for="inq-group"><UsersIcon />Group size</Field.Label>
						<Input id="inq-group" type="number" min={1} max={1000} bind:value={values.groupSize} />
						{#if errors.groupSize}<Field.Error>{errors.groupSize}</Field.Error>{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="inq-currency"><BanknoteIcon />Currency</Field.Label>
						<Select.Root type="single" bind:value={values.currency}>
							<Select.Trigger id="inq-currency" class="w-full">{values.currency || 'Not set'}</Select.Trigger>
							<Select.Content>
								<Select.Item value="" label="Not set" />
								<Select.Item value="USD" label="USD" />
								<Select.Item value="UGX" label="UGX" />
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</div>

				<Field.Field data-invalid={errors.message ? true : undefined}>
					<Field.Label for="inq-message"><MessageSquareIcon />Message</Field.Label>
					<Textarea
						id="inq-message"
						bind:value={values.message}
						rows={5}
						maxlength={5000}
						placeholder="What they asked for, in their words if possible"
						aria-invalid={errors.message ? true : undefined}
					/>
					{#if errors.message}<Field.Error>{errors.message}</Field.Error>{/if}
				</Field.Field>
			</Field.Group>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			{#if onCancel}<Button type="button" variant="outline" onclick={onCancel}>Cancel</Button>{/if}
			<Button type="submit" disabled={form.submitting}>
				{form.submitting ? 'Saving…' : inquiry ? 'Save details' : 'Log inquiry'}
			</Button>
		</Card.Footer>
	</Card.Root>
</form>

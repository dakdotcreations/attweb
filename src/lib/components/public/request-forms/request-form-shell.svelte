<!--
	Frame for the flight and study abroad request forms: posts to the /contact action (works
	without JS; enhanced in place), adds the context + spam-trap fields, the shared contact block,
	the error message, the submit button and the thank-you panel. The kind-specific fields go in `children`.
-->
<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { page } from '$app/state';
	import { CONTACT_CHANNELS, channelLabels, type InquiryKind } from '#lib/inquiries.js';
	import InquirySuccess from '../inquiry-success.svelte';
	import FieldError from './field-error.svelte';
	import { chipClass, inputClass, labelClass, sectionTitleClass } from './styles.js';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import SendIcon from '@lucide/svelte/icons/send';
	import type { Snippet } from 'svelte';

	type Values = Record<string, string>;

	let {
		kind,
		serviceId = null,
		whatsappNumber,
		submitLabel,
		successText,
		notesPlaceholder,
		initial = {},
		errors = $bindable({}),
		initialSuccess = null,
		onsubmit,
		onreset,
		children
	}: {
		kind: Exclude<InquiryKind, 'GENERAL'>;
		serviceId?: string | null;
		whatsappNumber: string | null;
		submitLabel: string;
		successText: string;
		notesPlaceholder: string;
		/** Values from a no-JS submission (the contact fields are read here). */
		initial?: Values;
		errors?: Record<string, string>;
		initialSuccess?: { number: number | null } | null;
		/** Adjust the outgoing FormData (e.g. institution ranking) before an enhanced submit. */
		onsubmit?: (formData: FormData) => void;
		/** Clear the kind-specific fields after "Send another request". */
		onreset?: () => void;
		/** Kind-specific fields; receives the id helper for label/input pairs. */
		children: Snippet<[(name: string) => string]>;
	} = $props();

	// svelte-ignore state_referenced_locally
	let success = $state<{ number: number | null } | null>(initialSuccess);
	let message = $state<string | null>(null);
	let submitting = $state(false);
	// svelte-ignore state_referenced_locally
	let contact = $state<Values>({ preferredContact: 'WHATSAPP', ...initial });

	const startedAt = Date.now();
	const uid = $props.id();
	const id = (name: string) => `${uid}-${name.replaceAll('.', '-')}`;
</script>

{#snippet input(
	name: string,
	label: string,
	opts: { type?: string; placeholder?: string; autocomplete?: string; required?: boolean; max?: number; inputmode?: 'tel' | 'email' | 'text' } = {}
)}
	<div>
		<label for={id(name)} class={labelClass}>
			{label}{#if opts.required}<span class="text-gold-600"> *</span>{/if}
		</label>
		<input
			id={id(name)}
			{name}
			type={opts.type ?? 'text'}
			bind:value={contact[name]}
			placeholder={opts.placeholder}
			autocomplete={opts.autocomplete as never}
			maxlength={opts.max ?? 200}
			inputmode={opts.inputmode}
			required={opts.required}
			aria-invalid={errors[name] ? true : undefined}
			aria-describedby={errors[name] ? id(`${name}-error`) : undefined}
			class={inputClass(!!errors[name])}
		/>
		<FieldError id={id(`${name}-error`)} message={errors[name]} />
	</div>
{/snippet}

{#if success}
	<InquirySuccess
		number={success.number}
		{whatsappNumber}
		text={successText}
		againLabel="Send another request"
		onagain={() => {
			success = null;
			errors = {};
			contact = { preferredContact: contact.preferredContact };
			onreset?.();
		}}
	/>
{:else}
	<form
		method="POST"
		action="/contact"
		novalidate
		class="rounded-md bg-white p-6 ring-1 ring-forest-950/10 sm:p-8"
		use:enhance={({ formData }) => {
			onsubmit?.(formData);
			submitting = true;
			message = null;
			return async ({ result }) => {
				submitting = false;
				if (result.type === 'success') {
					errors = {};
					success = { number: (result.data?.number as number | null) ?? null };
				} else if (result.type === 'failure') {
					errors = (result.data?.errors as Record<string, string>) ?? {};
					message = (result.data?.message as string) ?? 'Something went wrong. Please try again.';
				} else {
					await applyAction(result);
				}
			};
		}}
	>
		<!-- Context + spam traps (honeypot is visually hidden and skipped by keyboard/screen readers). -->
		<input type="hidden" name="kind" value={kind} />
		<input type="hidden" name="serviceId" value={serviceId ?? ''} />
		<input type="hidden" name="sourceUrl" value={page.url.pathname} />
		<input type="hidden" name="startedAt" value={startedAt} />
		<div class="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
			<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
		</div>

		<div class="space-y-8">
			{@render children(id)}

			<section class="border-forest-900/10 border-t pt-8" aria-labelledby={id('contact-title')}>
				<h3 id={id('contact-title')} class="{sectionTitleClass} mb-5">Your details</h3>
				<div class="grid gap-5 sm:grid-cols-2">
					<div class="sm:col-span-2">
						{@render input('name', 'Full name', { autocomplete: 'name', required: true, max: 120 })}
					</div>
					{@render input('phone', 'WhatsApp / phone', { type: 'tel', autocomplete: 'tel', placeholder: '+256 700 000000', max: 40, inputmode: 'tel' })}
					{@render input('email', 'Email', { type: 'email', autocomplete: 'email', max: 200, inputmode: 'email' })}
					<p class="text-ink/60 -mt-2 text-sm sm:col-span-2">Give us a WhatsApp number or an email. One is enough.</p>
					<div class="sm:col-span-2">
						{@render input('country', 'Country you live in', { autocomplete: 'country-name', max: 80 })}
					</div>

					<fieldset class="sm:col-span-2">
						<legend class="text-forest-900 mb-2 text-sm font-semibold">Best way to reach you</legend>
						<div class="flex flex-wrap gap-2">
							{#each CONTACT_CHANNELS as channel (channel)}
								<label class={chipClass(contact.preferredContact === channel)}>
									<input type="radio" name="preferredContact" value={channel} bind:group={contact.preferredContact} class="sr-only" />
									{channelLabels[channel]}
								</label>
							{/each}
						</div>
					</fieldset>

					<div class="sm:col-span-2">
						<label for={id('message')} class={labelClass}>Anything else? <span class="text-ink/50 font-normal">(optional)</span></label>
						<textarea
							id={id('message')}
							name="message"
							rows="4"
							maxlength="5000"
							bind:value={contact.message}
							placeholder={notesPlaceholder}
							aria-invalid={errors.message ? true : undefined}
							aria-describedby={errors.message ? id('message-error') : undefined}
							class={inputClass(!!errors.message)}
						></textarea>
						<FieldError id={id('message-error')} message={errors.message} />
					</div>
				</div>
			</section>
		</div>

		{#if message}
			<p class="text-crane-red mt-6 text-sm font-semibold" role="alert">{message}</p>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-4">
			<button
				type="submit"
				disabled={submitting}
				class="bg-forest-800 text-paper hover:bg-forest-700 focus-visible:ring-forest-700/30 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:opacity-60"
			>
				{#if submitting}<LoaderIcon class="size-4 animate-spin" />Sending…{:else}<SendIcon class="size-4" />{submitLabel}{/if}
			</button>
			<p class="text-ink/55 text-xs">No payment needed. By sending this, you agree we may contact you about your request.</p>
		</div>
	</form>
{/if}

<!--
	Public inquiry form. Posts to the /contact action (works without JS; enhanced in place).
	Used on package pages (packageId set), service pages (serviceId) and the contact page.
-->
<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { page } from '$app/state';
	import { CONTACT_CHANNELS, channelLabels } from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import Postmark from './postmark.svelte';
	import LoaderIcon from '@lucide/svelte/icons/loader-circle';
	import SendIcon from '@lucide/svelte/icons/send';
	import WhatsAppButton from './whatsapp-button.svelte';

	type Values = Record<string, string>;

	let {
		packageId = null,
		serviceId = null,
		about = null,
		services = [],
		whatsappNumber,
		messagePlaceholder = 'Tell us about your plans: what you would love to see, your budget, any special requests…',
		initial = {},
		initialErrors = {},
		initialSuccess = null
	}: {
		packageId?: string | null;
		serviceId?: string | null;
		/** Shown above the form, e.g. the package title. */
		about?: string | null;
		/** Lets the visitor pick a service (contact page). */
		services?: { id: string; name: string }[];
		whatsappNumber: string | null;
		messagePlaceholder?: string;
		/** Values/errors/result from a no-JS submission. */
		initial?: Values;
		initialErrors?: Record<string, string>;
		initialSuccess?: { number: number | null } | null;
	} = $props();

	// svelte-ignore state_referenced_locally
	let errors = $state<Record<string, string>>(initialErrors);
	// svelte-ignore state_referenced_locally
	let success = $state<{ number: number | null } | null>(initialSuccess);
	let message = $state<string | null>(null);
	let submitting = $state(false);
	/** Date on the RECEIVED postmark, e.g. "11 NOV 26" (fits inside the inner ring). */
	const receivedOn = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date()).toUpperCase();
	// svelte-ignore state_referenced_locally
	let values = $state<Values>({ preferredContact: 'WHATSAPP', ...initial });

	const startedAt = Date.now();
	const today = new Date().toISOString().slice(0, 10);
	const uid = $props.id();
	const id = (name: string) => `${uid}-${name}`;
</script>

{#snippet error(name: string)}
	{#if errors[name]}<p id={id(`${name}-error`)} class="text-crane-red mt-1.5 text-xs font-semibold">{errors[name]}</p>{/if}
{/snippet}

{#snippet input(name: string, label: string, opts: { type?: string; placeholder?: string; autocomplete?: string; required?: boolean; max?: number; min?: string; inputmode?: 'numeric' | 'tel' | 'email' | 'text' } = {})}
	<div>
		<label for={id(name)} class="text-forest-900 mb-1.5 block text-sm font-semibold">
			{label}{#if opts.required}<span class="text-gold-600"> *</span>{/if}
		</label>
		<input
			id={id(name)}
			{name}
			type={opts.type ?? 'text'}
			bind:value={values[name]}
			placeholder={opts.placeholder}
			autocomplete={opts.autocomplete as never}
			maxlength={opts.max ?? 200}
			min={opts.min}
			inputmode={opts.inputmode}
			required={opts.required}
			aria-invalid={errors[name] ? true : undefined}
			aria-describedby={errors[name] ? id(`${name}-error`) : undefined}
			class={cn(
				'text-ink placeholder:text-ink/40 w-full rounded-md border bg-white px-4 py-3 text-base transition-colors outline-none focus:ring-4',
				errors[name] ? 'border-crane-red focus:ring-crane-red/15' : 'focus:border-forest-700 focus:ring-forest-700/15 border-forest-900/15'
			)}
		/>
		{@render error(name)}
	</div>
{/snippet}

{#if success}
	<div class="rounded-md bg-white p-8 text-center ring-1 ring-forest-950/10 sm:p-10" role="status">
		<!-- The inquiry is cancelled like a letter: RECEIVED, Kampala, today's date. -->
		<Postmark
			place="RECEIVED"
			line="KAMPALA"
			date={receivedOn}
			label="Received in Kampala on {receivedOn}"
			class="received-stamp text-forest-800 mx-auto w-64 -rotate-6"
		/>
		<h3 class="font-display text-forest-950 mt-6 text-3xl font-semibold uppercase">Thank you, we've got it</h3>
		<p class="text-ink/70 mx-auto mt-3 max-w-md">
			{#if success.number}Your reference is <strong class="text-forest-900">#{success.number}</strong>.{/if}
			A member of our team will get back to you with options and prices.
		</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<WhatsAppButton
				number={whatsappNumber}
				message={success.number ? `Hi Altura, about my inquiry #${success.number}` : undefined}
				label="Need us sooner? WhatsApp"
			/>
			<button
				type="button"
				class="text-forest-800 hover:text-forest-600 rounded-full px-5 py-2.5 text-sm font-bold"
				onclick={() => {
					success = null;
					values = { preferredContact: values.preferredContact };
				}}
			>
				Send another message
			</button>
		</div>
	</div>
{:else}
	<form
		method="POST"
		action="/contact"
		novalidate
		class="rounded-md bg-white p-6 ring-1 ring-forest-950/10 sm:p-8"
		use:enhance={() => {
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
		{#if about}
			<p class="bg-forest-100 text-forest-900 mb-6 rounded-md px-4 py-3 text-sm">
				Inquiring about <strong>{about}</strong>
			</p>
		{/if}

		<!-- Context + spam traps (honeypot is visually hidden and skipped by keyboard/screen readers). -->
		<input type="hidden" name="packageId" value={packageId ?? ''} />
		{#if !services.length}<input type="hidden" name="serviceId" value={serviceId ?? ''} />{/if}
		<input type="hidden" name="sourceUrl" value={page.url.pathname} />
		<input type="hidden" name="startedAt" value={startedAt} />
		<div class="absolute -left-[9999px] h-0 overflow-hidden" aria-hidden="true">
			<label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div class="sm:col-span-2">
				{@render input('name', 'Your name', { autocomplete: 'name', required: true, max: 120 })}
			</div>
			{@render input('phone', 'WhatsApp / phone', { type: 'tel', autocomplete: 'tel', placeholder: '+256 700 000000', max: 40, inputmode: 'tel' })}
			{@render input('email', 'Email', { type: 'email', autocomplete: 'email', max: 200, inputmode: 'email' })}
			<p class="text-ink/60 -mt-2 text-sm sm:col-span-2">Give us a WhatsApp number or an email. One is enough.</p>

			{#if services.length}
				<div class="sm:col-span-2">
					<label for={id('serviceId')} class="text-forest-900 mb-1.5 block text-sm font-semibold">I'm interested in</label>
					<select
						id={id('serviceId')}
						name="serviceId"
						bind:value={values.serviceId}
						class="text-ink focus:border-forest-700 focus:ring-forest-700/15 border-forest-900/15 w-full rounded-md border bg-white px-4 py-3 text-base outline-none focus:ring-4"
					>
						<option value="">Something else / not sure yet</option>
						{#each services as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
					</select>
				</div>
			{/if}

			{@render input('travelDate', 'Travel date', { type: 'date', min: today })}
			{@render input('groupSize', 'Number of travellers', { type: 'number', min: '1', inputmode: 'numeric' })}
			<div class="sm:col-span-2">
				{@render input('country', 'Country you are travelling from', { autocomplete: 'country-name', max: 80 })}
			</div>

			<fieldset class="sm:col-span-2">
				<legend class="text-forest-900 mb-2 text-sm font-semibold">Best way to reach you</legend>
				<div class="flex flex-wrap gap-2">
					{#each CONTACT_CHANNELS as channel (channel)}
						<label
							class={cn(
								'cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors has-focus-visible:ring-4 has-focus-visible:ring-forest-700/20',
								values.preferredContact === channel
									? 'bg-forest-800 border-forest-800 text-paper'
									: 'border-forest-900/15 text-forest-900 hover:border-forest-700 bg-white'
							)}
						>
							<input type="radio" name="preferredContact" value={channel} bind:group={values.preferredContact} class="sr-only" />
							{channelLabels[channel]}
						</label>
					{/each}
				</div>
			</fieldset>

			<div class="sm:col-span-2">
				<label for={id('message')} class="text-forest-900 mb-1.5 block text-sm font-semibold">
					Your message<span class="text-gold-600"> *</span>
				</label>
				<textarea
					id={id('message')}
					name="message"
					rows="5"
					maxlength="5000"
					required
					bind:value={values.message}
					placeholder={messagePlaceholder}
					aria-invalid={errors.message ? true : undefined}
					aria-describedby={errors.message ? id('message-error') : undefined}
					class={cn(
						'text-ink placeholder:text-ink/40 w-full rounded-md border bg-white px-4 py-3 text-base outline-none focus:ring-4',
						errors.message ? 'border-crane-red focus:ring-crane-red/15' : 'focus:border-forest-700 focus:ring-forest-700/15 border-forest-900/15'
					)}
				></textarea>
				{@render error('message')}
			</div>
		</div>

		{#if message}
			<p class="text-crane-red mt-5 text-sm font-semibold" role="alert">{message}</p>
		{/if}

		<div class="mt-6 flex flex-wrap items-center gap-4">
			<button
				type="submit"
				disabled={submitting}
				class="bg-forest-800 text-paper hover:bg-forest-700 focus-visible:ring-forest-700/30 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none disabled:opacity-60"
			>
				{#if submitting}<LoaderIcon class="size-4 animate-spin" />Sending…{:else}<SendIcon class="size-4" />Send inquiry{/if}
			</button>
			<p class="text-ink/55 text-xs">No payment needed. By sending this, you agree we may contact you about your inquiry.</p>
		</div>
	</form>
{/if}

<style>
	/* The RECEIVED cancel lands like a hand stamp (scale only; the rotate utility is separate). */
	@media (prefers-reduced-motion: no-preference) {
		:global(.received-stamp) {
			animation: received-land 0.55s cubic-bezier(0.2, 0.9, 0.2, 1) both;
		}
	}
	@keyframes received-land {
		from {
			opacity: 0;
			scale: 1.35;
		}
		to {
			opacity: 1;
			scale: 1;
		}
	}
</style>

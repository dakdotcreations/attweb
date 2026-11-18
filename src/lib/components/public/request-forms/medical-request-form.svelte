<!--
	Medical tourism request form (service pages whose formType is MEDICAL). Not only for patients:
	the visitor picks a purpose (treatment, check-up/wellness, study/research/elective, or a
	professional visit), a medical field and describes the trip. The medical-reports question only
	applies to treatment and is shown with CSS :has(), so it also works without JS. Choosing medical
	partners is optional (staff recommend hospitals otherwise); without JS the partner cards are
	plain checkboxes and the country filter is hidden.
-->
<script module lang="ts">
	export type PublicMedicalPartner = {
		id: string;
		name: string;
		country: string;
		logo: { thumbUrl: string; alt: string } | null;
	};
</script>

<script lang="ts">
	import {
		MAX_MEDICAL_PARTNERS,
		MAX_MEDICAL_TRAVELLERS,
		MEDICAL_PURPOSES,
		MEDICAL_SPECIALTIES,
		MEDICAL_TIMEFRAMES,
		medicalPurposeLabels,
		medicalSpecialtyLabels,
		medicalTimeframeLabels,
		type MedicalPurpose
	} from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import FieldError from './field-error.svelte';
	import RequestFormShell from './request-form-shell.svelte';
	import { chipClass, inputClass, labelClass, sectionTitleClass, splitEcho } from './styles.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import HospitalIcon from '@lucide/svelte/icons/hospital';
	import LockIcon from '@lucide/svelte/icons/lock';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';

	type Values = Record<string, string>;

	let {
		partners = [],
		serviceId = null,
		whatsappNumber,
		initial = {},
		initialErrors = {},
		initialSuccess = null
	}: {
		/** Published medical partners (managed at /dashboard/medical-partners). */
		partners?: PublicMedicalPartner[];
		serviceId?: string | null;
		whatsappNumber: string | null;
		/** Values/errors/result from a no-JS submission. */
		initial?: Values;
		initialErrors?: Record<string, string>;
		initialSuccess?: { number: number | null } | null;
	} = $props();

	// svelte-ignore state_referenced_locally
	const start = initial;
	// svelte-ignore state_referenced_locally
	let errors = $state<Record<string, string>>(initialErrors);
	let purpose = $state(start.purpose ?? '');
	let specialty = $state(start.specialty ?? '');
	let description = $state(start.description ?? '');
	let hasReports = $state(start.hasReports === 'YES' || start.hasReports === 'NO' ? start.hasReports : '');
	let timeframe = $state(start.timeframe ?? '');
	let travellers = $state(Number(start.travellers) || 1);

	const placeholders: Record<MedicalPurpose | '', string> = {
		TREATMENT: 'e.g. My father needs a knee replacement. His doctor in Kampala recommended surgery abroad.',
		CHECKUP: 'e.g. A full executive health check for two of us, with a few days of rest afterwards.',
		RESEARCH: 'e.g. Final-year medical students looking for a 4-week cardiology elective or a research placement.',
		PROFESSIONAL: 'e.g. Three nurses attending a training course, or a hospital visit for our clinic’s management.',
		'': 'What you need, who is travelling and anything you already have in mind.'
	};
	const placeholder = $derived(placeholders[purpose as MedicalPurpose] ?? placeholders['']);
	// svelte-ignore state_referenced_locally
	let chosen = $state<string[]>(
		splitEcho(start.partnerIds).filter((id) => partners.some((p) => p.id === id)).slice(0, MAX_MEDICAL_PARTNERS)
	);
	let country = $state('');

	/** The country filter needs JS; without it every partner stays listed. */
	let hydrated = $state(false);
	$effect(() => {
		hydrated = true;
	});

	const countries = $derived([...new Set(partners.map((p) => p.country))].sort((a, b) => a.localeCompare(b)));
	const full = $derived(chosen.length >= MAX_MEDICAL_PARTNERS);

	function toggle(id: string, checked: boolean) {
		if (checked && !chosen.includes(id) && !full) chosen.push(id);
		if (!checked) chosen = chosen.filter((c) => c !== id);
		if (errors.partnerIds) errors = { ...errors, partnerIds: '' };
	}

	function reset() {
		purpose = '';
		specialty = '';
		description = '';
		hasReports = '';
		timeframe = '';
		travellers = 1;
		chosen = [];
		country = '';
	}
</script>

<RequestFormShell
	kind="MEDICAL"
	{serviceId}
	{whatsappNumber}
	initial={start}
	bind:errors
	{initialSuccess}
	submitLabel="Send my request"
	successText="Our medical travel team will contact you, usually within one working day, with options and the next steps."
	notesPlaceholder="A budget, preferred dates, mobility needs, a university or programme you're with, or anything else we should know…"
	onreset={reset}
>
	{#snippet children(id)}
		<section class="medical space-y-5" aria-labelledby={id('trip-title')}>
			<div>
				<h3 id={id('trip-title')} class={sectionTitleClass}>Your trip</h3>
				<p class="text-ink/60 mt-1 flex items-center gap-1.5 text-sm">
					<LockIcon class="size-3.5 shrink-0" aria-hidden="true" />
					Only our medical travel team sees what you share here.
				</p>
			</div>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">What's the purpose of your trip?<span class="text-gold-600"> *</span></legend>
				<div class="flex flex-wrap gap-2">
					{#each MEDICAL_PURPOSES as p (p)}
						<label class={chipClass(purpose === p)}>
							<input type="radio" name="purpose" value={p} bind:group={purpose} required class="sr-only" />
							{medicalPurposeLabels[p]}
						</label>
					{/each}
				</div>
				<FieldError id={id('purpose-error')} message={errors.purpose} />
			</fieldset>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">Which medical field?<span class="text-gold-600"> *</span></legend>
				<div class="flex flex-wrap gap-2">
					{#each MEDICAL_SPECIALTIES as s (s)}
						<label class={chipClass(specialty === s)}>
							<input type="radio" name="specialty" value={s} bind:group={specialty} required class="sr-only" />
							{medicalSpecialtyLabels[s]}
						</label>
					{/each}
				</div>
				<FieldError id={id('specialty-error')} message={errors.specialty} />
			</fieldset>

			<div>
				<label for={id('description')} class={labelClass}>Tell us more about the trip<span class="text-gold-600"> *</span></label>
				<textarea
					id={id('description')}
					name="description"
					bind:value={description}
					rows="4"
					maxlength="3000"
					required
					{placeholder}
					aria-invalid={errors.description ? true : undefined}
					aria-describedby={errors.description ? id('description-error') : undefined}
					class={inputClass(!!errors.description, 'resize-y')}
				></textarea>
				<FieldError id={id('description-error')} message={errors.description} />
			</div>

			<!-- Treatment trips only (CSS-driven, see <style>). -->
			<fieldset class="reports" aria-describedby={id('reports-hint')}>
				<legend class="text-forest-900 mb-1 text-sm font-semibold">Do you have recent medical reports?<span class="text-gold-600"> *</span></legend>
				<p id={id('reports-hint')} class="text-ink/60 mb-3 text-xs">
					Scans, lab results or a doctor's letter. Don't attach them here; we'll tell you how to share them securely.
				</p>
				<div class="flex flex-wrap gap-2">
					<label class={chipClass(hasReports === 'YES')}>
						<input type="radio" name="hasReports" value="YES" bind:group={hasReports} required={purpose === 'TREATMENT'} class="sr-only" />
						Yes, I have reports
					</label>
					<label class={chipClass(hasReports === 'NO')}>
						<input type="radio" name="hasReports" value="NO" bind:group={hasReports} class="sr-only" />
						Not yet
					</label>
				</div>
				<FieldError id={id('hasReports-error')} message={errors.hasReports} />
			</fieldset>
		</section>

		{#if partners.length}
			<section class="border-forest-900/10 space-y-5 border-t pt-8" aria-labelledby={id('hospitals-title')}>
				<div>
					<h3 id={id('hospitals-title')} class={sectionTitleClass}>Hospitals</h3>
					<p id={id('hospitals-hint')} class="text-ink/60 mt-1 text-sm">
						Optional. Pick up to {MAX_MEDICAL_PARTNERS} of our partner hospitals and institutions, or leave this open and we'll
						recommend the best fit for your trip.
					</p>
				</div>

				{#if hydrated && countries.length > 1}
					<div class="flex flex-wrap gap-2" role="group" aria-label="Filter hospitals by country">
						{#each ['', ...countries] as c (c)}
							<button type="button" class={chipClass(country === c)} aria-pressed={country === c} onclick={() => (country = c)}>
								{c || 'All countries'}
							</button>
						{/each}
					</div>
				{/if}

				<fieldset aria-describedby={id('hospitals-hint')}>
					<legend class="sr-only">Partner hospitals</legend>
					<ul class="grid gap-3 sm:grid-cols-2">
						{#each partners as partner (partner.id)}
							{@const checked = chosen.includes(partner.id)}
							{@const disabled = full && !checked}
							<li class={cn(country && partner.country !== country && 'hidden')}>
								<label
									class={cn(
										'flex h-full cursor-pointer items-center gap-3 rounded-md border bg-white p-3 transition-colors has-focus-visible:ring-4 has-focus-visible:ring-forest-700/20',
										checked ? 'border-forest-800 ring-forest-800 ring-1' : 'border-forest-900/15 hover:border-forest-700',
										disabled && 'cursor-not-allowed opacity-50 hover:border-forest-900/15'
									)}
								>
									<input
										type="checkbox"
										name="partnerIds"
										value={partner.id}
										{checked}
										{disabled}
										onchange={(e) => toggle(partner.id, e.currentTarget.checked)}
										class="sr-only"
									/>
									<span class="bg-paper flex size-12 shrink-0 items-center justify-center overflow-hidden rounded ring-1 ring-forest-900/10">
										{#if partner.logo}
											<img src={partner.logo.thumbUrl} alt="" loading="lazy" class="size-full object-contain p-1" />
										{:else}
											<HospitalIcon class="text-forest-700 size-6" aria-hidden="true" />
										{/if}
									</span>
									<span class="min-w-0 flex-1">
										<span class="text-forest-950 block text-sm leading-snug font-bold">{partner.name}</span>
										<span class="text-ink/60 block text-xs">{partner.country}</span>
									</span>
									<span
										class={cn(
											'flex size-7 shrink-0 items-center justify-center rounded-full border',
											checked ? 'bg-forest-800 border-forest-800 text-paper' : 'border-forest-900/20 text-transparent'
										)}
										aria-hidden="true"
									>
										<CheckIcon class="size-4" />
									</span>
								</label>
							</li>
						{/each}
					</ul>
				</fieldset>
				{#if full}<p class="text-ink/60 text-sm">That's {MAX_MEDICAL_PARTNERS} hospitals. Remove one to pick another.</p>{/if}
				<FieldError id={id('partnerIds-error')} message={errors.partnerIds} />
			</section>
		{/if}

		<section class="border-forest-900/10 space-y-6 border-t pt-8" aria-labelledby={id('travel-title')}>
			<h3 id={id('travel-title')} class={sectionTitleClass}>Travel</h3>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">When are you hoping to travel?<span class="text-gold-600"> *</span></legend>
				<div class="flex flex-wrap gap-2">
					{#each MEDICAL_TIMEFRAMES as t (t)}
						<label class={chipClass(timeframe === t)}>
							<input type="radio" name="timeframe" value={t} bind:group={timeframe} required class="sr-only" />
							{medicalTimeframeLabels[t]}
						</label>
					{/each}
				</div>
				<FieldError id={id('timeframe-error')} message={errors.timeframe} />
			</fieldset>

			<div class={cn('max-w-sm rounded-md border px-4 py-3', errors.travellers ? 'border-crane-red' : 'border-forest-900/15')}>
				<label for={id('travellers')} class="text-forest-900 block text-sm font-semibold">How many people are travelling?</label>
				<p class="text-ink/55 text-xs">Including you: family or carers, or everyone in a study or work group.</p>
				<div class="mt-2 flex items-center gap-2">
					<button
						type="button"
						onclick={() => (travellers = Math.max(1, travellers - 1))}
						disabled={travellers <= 1}
						class="border-forest-900/15 text-forest-900 hover:border-forest-700 flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-35"
						aria-label="Fewer people"
					>
						<MinusIcon class="size-4" />
					</button>
					<input
						id={id('travellers')}
						name="travellers"
						type="number"
						inputmode="numeric"
						min="1"
						max={MAX_MEDICAL_TRAVELLERS}
						bind:value={travellers}
						aria-invalid={errors.travellers ? true : undefined}
						aria-describedby={errors.travellers ? id('travellers-error') : undefined}
						class="text-forest-950 w-12 [appearance:textfield] bg-transparent text-center text-lg font-bold outline-none [&::-webkit-inner-spin-button]:appearance-none"
					/>
					<button
						type="button"
						onclick={() => (travellers = Math.min(MAX_MEDICAL_TRAVELLERS, travellers + 1))}
						disabled={travellers >= MAX_MEDICAL_TRAVELLERS}
						class="border-forest-900/15 text-forest-900 hover:border-forest-700 flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-35"
						aria-label="More people"
					>
						<PlusIcon class="size-4" />
					</button>
				</div>
				<FieldError id={id('travellers-error')} message={errors.travellers} />
			</div>
		</section>
	{/snippet}
</RequestFormShell>

<style>
	/* The medical-reports question only applies to treatment trips; CSS-driven so it works without JS. */
	.reports {
		display: none;
	}
	.medical:has(input[name='purpose'][value='TREATMENT']:checked) .reports {
		display: block;
	}
</style>

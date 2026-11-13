<!--
	Study abroad request form (service pages whose formType is STUDY_ABROAD). Students pick up to
	MAX_INSTITUTIONS partner institutions in order of preference. Without JS the choices are plain
	checkboxes (ranked by list order); the server enforces the limit either way.
-->
<script module lang="ts">
	export type PublicInstitution = {
		id: string;
		name: string;
		country: string;
		logo: { thumbUrl: string; alt: string } | null;
	};
</script>

<script lang="ts">
	import { MAX_INSTITUTIONS, STUDY_LEVELS, studyLevelLabels } from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import FieldError from './field-error.svelte';
	import RequestFormShell from './request-form-shell.svelte';
	import { chipClass, inputClass, labelClass, sectionTitleClass, splitEcho } from './styles.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import XIcon from '@lucide/svelte/icons/x';

	type Values = Record<string, string>;

	let {
		institutions,
		serviceId = null,
		whatsappNumber,
		initial = {},
		initialErrors = {},
		initialSuccess = null
	}: {
		institutions: PublicInstitution[];
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
	// svelte-ignore state_referenced_locally
	let chosen = $state<string[]>(splitEcho(start.institutionIds).filter((id) => institutions.some((i) => i.id === id)).slice(0, MAX_INSTITUTIONS));
	let level = $state(start.level ?? '');
	let course = $state(start.course ?? '');
	let intake = $state(start.intake ?? '');
	let qualification = $state(start.qualification ?? '');
	let country = $state('');

	const countries = $derived([...new Set(institutions.map((i) => i.country))].sort((a, b) => a.localeCompare(b)));
	const byId = $derived(new Map(institutions.map((i) => [i.id, i])));
	const full = $derived(chosen.length >= MAX_INSTITUTIONS);

	function toggle(id: string, checked: boolean) {
		if (checked && !chosen.includes(id) && !full) chosen.push(id);
		if (!checked) chosen = chosen.filter((c) => c !== id);
		if (errors.institutionIds) errors = { ...errors, institutionIds: '' };
	}

	/** Send choices in the order they were picked (DOM order would lose the ranking). */
	function rank(formData: FormData) {
		formData.delete('institutionIds');
		for (const id of chosen) formData.append('institutionIds', id);
	}

	function reset() {
		chosen = [];
		level = '';
		course = '';
		intake = '';
		qualification = '';
		country = '';
	}

	const ordinal = ['1st', '2nd', '3rd', '4th', '5th'];
</script>

<RequestFormShell
	kind="STUDY_ABROAD"
	{serviceId}
	{whatsappNumber}
	initial={start}
	bind:errors
	{initialSuccess}
	submitLabel="Send study request"
	successText="An admissions advisor will get back to you about entry requirements, fees and the next steps."
	notesPlaceholder="Your budget, scholarship questions, English test results, or anything else we should know…"
	onsubmit={rank}
	onreset={reset}
>
	{#snippet children(id)}
		<section class="space-y-5" aria-labelledby={id('where-title')}>
			<div>
				<h3 id={id('where-title')} class={sectionTitleClass}>Where you want to study</h3>
				<p id={id('where-hint')} class="text-ink/60 mt-1 text-sm">
					Choose up to {MAX_INSTITUTIONS} of our partner institutions, in order of preference.
				</p>
			</div>

			{#if countries.length > 1}
				<div class="flex flex-wrap gap-2" role="group" aria-label="Filter by country">
					{#each ['', ...countries] as c (c)}
						<button type="button" class={chipClass(country === c)} aria-pressed={country === c} onclick={() => (country = c)}>
							{c || 'All countries'}
						</button>
					{/each}
				</div>
			{/if}

			{#if chosen.length}
				<ol class="bg-forest-100/60 flex flex-wrap gap-2 rounded-md p-3" aria-label="Your choices">
					{#each chosen as cid, i (cid)}
						{@const inst = byId.get(cid)}
						{#if inst}
							<li class="text-forest-900 inline-flex items-center gap-2 rounded-full bg-white py-1 pr-1.5 pl-3 text-sm font-semibold ring-1 ring-forest-900/10">
								<span class="text-gold-600 text-xs font-bold">{ordinal[i]}</span>
								{inst.name}
								<button
									type="button"
									onclick={() => toggle(cid, false)}
									class="text-ink/50 hover:text-crane-red rounded-full p-1"
									aria-label="Remove {inst.name}"
								>
									<XIcon class="size-3.5" />
								</button>
							</li>
						{/if}
					{/each}
				</ol>
			{/if}

			<fieldset aria-describedby={id('where-hint')}>
				<legend class="sr-only">Partner institutions</legend>
				<ul class="grid gap-3 sm:grid-cols-2">
					{#each institutions as inst (inst.id)}
						{@const index = chosen.indexOf(inst.id)}
						{@const checked = index !== -1}
						{@const disabled = full && !checked}
						<li class={cn(country && inst.country !== country && 'hidden')}>
							<label
								class={cn(
									'flex h-full cursor-pointer items-center gap-3 rounded-md border bg-white p-3 transition-colors has-focus-visible:ring-4 has-focus-visible:ring-forest-700/20',
									checked ? 'border-forest-800 ring-forest-800 ring-1' : 'border-forest-900/15 hover:border-forest-700',
									disabled && 'cursor-not-allowed opacity-50 hover:border-forest-900/15'
								)}
							>
								<input
									type="checkbox"
									name="institutionIds"
									value={inst.id}
									{checked}
									{disabled}
									onchange={(e) => toggle(inst.id, e.currentTarget.checked)}
									class="sr-only"
								/>
								<span class="bg-paper flex size-12 shrink-0 items-center justify-center overflow-hidden rounded ring-1 ring-forest-900/10">
									{#if inst.logo}
										<img src={inst.logo.thumbUrl} alt="" loading="lazy" class="size-full object-contain p-1" />
									{:else}
										<GraduationCapIcon class="text-forest-700 size-6" aria-hidden="true" />
									{/if}
								</span>
								<span class="min-w-0 flex-1">
									<span class="text-forest-950 block text-sm leading-snug font-bold">{inst.name}</span>
									<span class="text-ink/60 block text-xs">{inst.country}</span>
								</span>
								<span
									class={cn(
										'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
										checked ? 'bg-forest-800 border-forest-800 text-paper' : 'border-forest-900/20 text-transparent'
									)}
									aria-hidden="true"
								>
									{checked ? index + 1 : ''}
								</span>
							</label>
						</li>
					{/each}
				</ul>
			</fieldset>
			{#if full}<p class="text-ink/60 text-sm">That's {MAX_INSTITUTIONS} choices. Remove one to pick another.</p>{/if}
			<FieldError id={id('institutionIds-error')} message={errors.institutionIds} />
		</section>

		<section class="border-forest-900/10 space-y-5 border-t pt-8" aria-labelledby={id('what-title')}>
			<h3 id={id('what-title')} class={sectionTitleClass}>What you want to study</h3>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">Study level<span class="text-gold-600"> *</span></legend>
				<div class="flex flex-wrap gap-2">
					{#each STUDY_LEVELS as l (l)}
						<label class={chipClass(level === l)}>
							<input type="radio" name="level" value={l} bind:group={level} required class="sr-only" />
							{studyLevelLabels[l]}
						</label>
					{/each}
				</div>
				<FieldError id={id('level-error')} message={errors.level} />
			</fieldset>

			<div class="grid gap-5 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label for={id('course')} class={labelClass}>Course or programme<span class="text-gold-600"> *</span></label>
					<input
						id={id('course')}
						name="course"
						bind:value={course}
						maxlength="150"
						required
						placeholder="e.g. MSc Data Science, Bachelor of Nursing"
						aria-invalid={errors.course ? true : undefined}
						aria-describedby={errors.course ? id('course-error') : undefined}
						class={inputClass(!!errors.course)}
					/>
					<FieldError id={id('course-error')} message={errors.course} />
				</div>
				<div>
					<label for={id('intake')} class={labelClass}>Preferred intake<span class="text-gold-600"> *</span></label>
					<input
						id={id('intake')}
						name="intake"
						bind:value={intake}
						maxlength="60"
						required
						placeholder="e.g. September 2027"
						aria-invalid={errors.intake ? true : undefined}
						aria-describedby={errors.intake ? id('intake-error') : undefined}
						class={inputClass(!!errors.intake)}
					/>
					<FieldError id={id('intake-error')} message={errors.intake} />
				</div>
				<div>
					<label for={id('qualification')} class={labelClass}>
						Highest qualification so far <span class="text-ink/50 font-normal">(optional)</span>
					</label>
					<input
						id={id('qualification')}
						name="qualification"
						bind:value={qualification}
						maxlength="150"
						placeholder="e.g. UACE, Bachelor's in Business"
						aria-invalid={errors.qualification ? true : undefined}
						aria-describedby={errors.qualification ? id('qualification-error') : undefined}
						class={inputClass(!!errors.qualification)}
					/>
					<FieldError id={id('qualification-error')} message={errors.qualification} />
				</div>
			</div>
		</section>
	{/snippet}
</RequestFormShell>

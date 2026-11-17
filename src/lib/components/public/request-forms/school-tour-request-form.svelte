<!--
	School tour request form (service pages whose formType is SCHOOL_TOUR). Teachers describe the
	school, roughly how many students, where they'd like to go and whether to include meals; staff
	plan and quote. Works without JS (plain fields).
-->
<script lang="ts">
	import { MAX_SCHOOL_STUDENTS } from '#lib/inquiries.js';
	import FieldError from './field-error.svelte';
	import RequestFormShell from './request-form-shell.svelte';
	import { chipClass, inputClass, labelClass, sectionTitleClass } from './styles.js';

	type Values = Record<string, string>;

	let {
		serviceId = null,
		whatsappNumber,
		initial = {},
		initialErrors = {},
		initialSuccess = null
	}: {
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
	let schoolName = $state(start.schoolName ?? '');
	let schoolLocation = $state(start.schoolLocation ?? '');
	let students = $state(start.students ?? '');
	let destination = $state(start.destination ?? '');
	let meals = $state(start.meals === 'YES' || start.meals === 'NO' ? start.meals : '');

	function reset() {
		schoolName = '';
		schoolLocation = '';
		students = '';
		destination = '';
		meals = '';
	}

	const invalid = (name: string) => (errors[name] ? true : undefined);
	const describedBy = (id: (name: string) => string, name: string) => (errors[name] ? id(`${name}-error`) : undefined);
</script>

<RequestFormShell
	kind="SCHOOL_TOUR"
	{serviceId}
	{whatsappNumber}
	initial={start}
	bind:errors
	{initialSuccess}
	submitLabel="Request a school tour plan"
	successText="Our team will put together a plan with transport, guides and a cost per student, and get back to you shortly."
	showCountry={false}
	notesPlaceholder="Preferred dates, number of teachers, class or year group, a budget per student, or anything else we should know…"
	onreset={reset}
>
	{#snippet children(id)}
		<section class="space-y-5" aria-labelledby={id('school-title')}>
			<h3 id={id('school-title')} class={sectionTitleClass}>Your school</h3>

			<div class="grid gap-5 sm:grid-cols-2">
				<div class="sm:col-span-2">
					<label for={id('schoolName')} class={labelClass}>School name<span class="text-gold-600"> *</span></label>
					<input
						id={id('schoolName')}
						name="schoolName"
						bind:value={schoolName}
						maxlength="150"
						required
						autocomplete="organization"
						placeholder="e.g. Kampala Parents' School"
						aria-invalid={invalid('schoolName')}
						aria-describedby={describedBy(id, 'schoolName')}
						class={inputClass(!!errors.schoolName)}
					/>
					<FieldError id={id('schoolName-error')} message={errors.schoolName} />
				</div>
				<div>
					<label for={id('schoolLocation')} class={labelClass}>Location<span class="text-gold-600"> *</span></label>
					<input
						id={id('schoolLocation')}
						name="schoolLocation"
						bind:value={schoolLocation}
						maxlength="120"
						required
						placeholder="e.g. Ntinda, Kampala"
						aria-invalid={invalid('schoolLocation')}
						aria-describedby={describedBy(id, 'schoolLocation')}
						class={inputClass(!!errors.schoolLocation)}
					/>
					<FieldError id={id('schoolLocation-error')} message={errors.schoolLocation} />
				</div>
				<div>
					<label for={id('students')} class={labelClass}>Number of students<span class="text-gold-600"> *</span></label>
					<input
						id={id('students')}
						name="students"
						type="number"
						inputmode="numeric"
						min="1"
						max={MAX_SCHOOL_STUDENTS}
						bind:value={students}
						required
						placeholder="An estimate is fine, e.g. 60"
						aria-invalid={invalid('students')}
						aria-describedby={describedBy(id, 'students')}
						class={inputClass(!!errors.students)}
					/>
					<FieldError id={id('students-error')} message={errors.students} />
				</div>
			</div>
		</section>

		<section class="border-forest-900/10 space-y-5 border-t pt-8" aria-labelledby={id('trip-title')}>
			<h3 id={id('trip-title')} class={sectionTitleClass}>The trip</h3>

			<div>
				<label for={id('destination')} class={labelClass}>Where would you like to go?<span class="text-gold-600"> *</span></label>
				<textarea
					id={id('destination')}
					name="destination"
					bind:value={destination}
					rows="4"
					maxlength="2000"
					required
					placeholder="Places you have in mind, or what the trip should cover, e.g. Source of the Nile and Jinja for S.2 geography, or a wildlife trip to Murchison Falls"
					aria-invalid={invalid('destination')}
					aria-describedby={describedBy(id, 'destination')}
					class={inputClass(!!errors.destination, 'resize-y')}
				></textarea>
				<FieldError id={id('destination-error')} message={errors.destination} />
			</div>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">Should we include meals?<span class="text-gold-600"> *</span></legend>
				<div class="flex flex-wrap gap-2">
					<label class={chipClass(meals === 'YES')}>
						<input type="radio" name="meals" value="YES" bind:group={meals} required class="sr-only" />
						Yes, include meals
					</label>
					<label class={chipClass(meals === 'NO')}>
						<input type="radio" name="meals" value="NO" bind:group={meals} class="sr-only" />
						No, we'll bring our own
					</label>
				</div>
				<FieldError id={id('meals-error')} message={errors.meals} />
			</fieldset>
		</section>
	{/snippet}
</RequestFormShell>

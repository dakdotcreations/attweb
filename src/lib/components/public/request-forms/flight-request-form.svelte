<!--
	Flight request form (service pages whose formType is FLIGHT). Staff quote and book; nothing is booked online.
	Without JS: one-way or return only (multi-city needs the "Add flight" rows).
-->
<script lang="ts">
	import {
		AIRLINES,
		AIRPORT_SUGGESTIONS,
		CABIN_CLASSES,
		MAX_AIRLINES,
		MAX_FLIGHT_LEGS,
		TRIP_TYPES,
		cabinLabels,
		tripTypeLabels,
		type TripType
	} from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import FieldError from './field-error.svelte';
	import RequestFormShell from './request-form-shell.svelte';
	import { chipClass, inputClass, labelClass, sectionTitleClass, splitEcho } from './styles.js';
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';

	type Leg = { from: string; to: string; date: string };
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

	const today = new Date().toISOString().slice(0, 10);

	function legsFrom(values: Values): Leg[] {
		const legs: Leg[] = [];
		for (let i = 0; i < MAX_FLIGHT_LEGS; i++) {
			const leg = { from: values[`legs.${i}.from`] ?? '', to: values[`legs.${i}.to`] ?? '', date: values[`legs.${i}.date`] ?? '' };
			if (i === 0 || leg.from || leg.to || leg.date) legs.push(leg);
		}
		return legs;
	}

	// svelte-ignore state_referenced_locally
	const start = initial;
	// svelte-ignore state_referenced_locally
	let errors = $state<Record<string, string>>(initialErrors);
	let tripType = $state<TripType>((TRIP_TYPES as readonly string[]).includes(start.tripType) ? (start.tripType as TripType) : 'RETURN');
	let legs = $state<Leg[]>(legsFrom(start));
	let returnDate = $state(start.returnDate ?? '');
	let pax = $state({
		adults: Number(start.adults) || 1,
		children: Number(start.children) || 0,
		infants: Number(start.infants) || 0
	});
	let cabin = $state(start.cabin ?? '');
	let airlines = $state<string[]>(splitEcho(start.airlines));
	let flexibleDates = $state(start.flexibleDates === 'on');

	/** Multi-city is offered only once JS runs: it needs the add/remove rows. */
	let hydrated = $state(false);
	$effect(() => {
		hydrated = true;
	});

	const visibleLegs = $derived(tripType === 'MULTI_CITY' ? legs : legs.slice(0, 1));
	const tripOptions = $derived(TRIP_TYPES.filter((t) => t !== 'MULTI_CITY' || hydrated || tripType === 'MULTI_CITY'));
	const airlineLimitReached = $derived(airlines.length >= MAX_AIRLINES);

	function chooseTrip(type: TripType) {
		tripType = type;
		if (type === 'MULTI_CITY' && legs.length < 2) addLeg();
	}

	function addLeg() {
		if (legs.length >= MAX_FLIGHT_LEGS) return;
		const prev = legs[legs.length - 1];
		// The next flight usually leaves from where the last one landed.
		legs.push({ from: prev?.to ?? '', to: '', date: '' });
	}

	function removeLeg(index: number) {
		legs.splice(index, 1);
		// Error keys are by position, so clear the leg errors rather than show them on the wrong row.
		errors = Object.fromEntries(Object.entries(errors).filter(([key]) => !key.startsWith('legs')));
	}

	function swap(leg: Leg) {
		[leg.from, leg.to] = [leg.to, leg.from];
	}

	function reset() {
		tripType = 'RETURN';
		legs = [{ from: '', to: '', date: '' }];
		returnDate = '';
		pax = { adults: 1, children: 0, infants: 0 };
		cabin = '';
		airlines = [];
		flexibleDates = false;
	}

	const paxRows = [
		{ key: 'adults', label: 'Adults', hint: '12 years and over', min: 1 },
		{ key: 'children', label: 'Children', hint: '2 to 11 years', min: 0 },
		{ key: 'infants', label: 'Infants', hint: 'Under 2, on an adult’s lap', min: 0 }
	] as const;
</script>

<RequestFormShell
	kind="FLIGHT"
	{serviceId}
	{whatsappNumber}
	initial={start}
	bind:errors
	{initialSuccess}
	submitLabel="Request flight quote"
	successText="Our ticketing team will compare fares and get back to you with options, usually the same working day."
	notesPlaceholder="Baggage, wheelchair assistance, special meals, a budget, or anything we should know…"
	onreset={reset}
>
	{#snippet children(id)}
		<datalist id={id('airports')}>
			{#each AIRPORT_SUGGESTIONS as airport (airport)}<option value={airport}></option>{/each}
		</datalist>

		{#snippet place(leg: Leg, index: number, field: 'from' | 'to', label: string, placeholder: string)}
			{@const name = `legs.${index}.${field}`}
			<div>
				<label for={id(name)} class={labelClass}>{label}<span class="text-gold-600"> *</span></label>
				<input
					id={id(name)}
					{name}
					bind:value={leg[field]}
					list={id('airports')}
					{placeholder}
					maxlength="80"
					autocomplete="off"
					required
					aria-invalid={errors[name] ? true : undefined}
					aria-describedby={errors[name] ? id(`${name}-error`) : undefined}
					class={inputClass(!!errors[name])}
				/>
				<FieldError id={id(`${name}-error`)} message={errors[name]} />
			</div>
		{/snippet}

		{#snippet date(name: string, label: string, min: string, bindTo: { get: () => string; set: (v: string) => void })}
			<div>
				<label for={id(name)} class={labelClass}>{label}<span class="text-gold-600"> *</span></label>
				<input
					id={id(name)}
					{name}
					type="date"
					bind:value={bindTo.get, bindTo.set}
					{min}
					required
					aria-invalid={errors[name] ? true : undefined}
					aria-describedby={errors[name] ? id(`${name}-error`) : undefined}
					class={inputClass(!!errors[name])}
				/>
				<FieldError id={id(`${name}-error`)} message={errors[name]} />
			</div>
		{/snippet}

		<section class="space-y-5" aria-labelledby={id('trip-title')}>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h3 id={id('trip-title')} class={sectionTitleClass}>Your trip</h3>
				<div class="bg-paper-200 inline-flex rounded-full p-1" role="radiogroup" aria-label="Trip type">
					{#each tripOptions as type (type)}
						<label
							class={cn(
								'cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors has-focus-visible:ring-4 has-focus-visible:ring-forest-700/20',
								tripType === type ? 'bg-forest-800 text-paper' : 'text-forest-900 hover:text-forest-700'
							)}
						>
							<input
								type="radio"
								name="tripType"
								value={type}
								checked={tripType === type}
								onchange={() => chooseTrip(type)}
								class="sr-only"
							/>
							{tripTypeLabels[type]}
						</label>
					{/each}
				</div>
			</div>

			{#if tripType === 'MULTI_CITY'}
				<ol class="space-y-4">
					{#each visibleLegs as leg, i (i)}
						<li class="border-forest-900/10 bg-paper/60 rounded-md border p-4 sm:p-5">
							<div class="mb-3 flex items-center justify-between gap-3">
								<p class="text-forest-900 flex items-center gap-2 text-sm font-bold">
									<PlaneIcon class="text-gold-600 size-4" aria-hidden="true" />
									Flight {i + 1}
								</p>
								{#if legs.length > 2}
									<button
										type="button"
										onclick={() => removeLeg(i)}
										class="text-ink/60 hover:text-crane-red inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
									>
										<XIcon class="size-3.5" />Remove<span class="sr-only"> flight {i + 1}</span>
									</button>
								{/if}
							</div>
							<div class="grid gap-4 sm:grid-cols-[1fr_1fr_11rem]">
								{@render place(leg, i, 'from', 'From', 'e.g. Entebbe (EBB)')}
								{@render place(leg, i, 'to', 'To', 'e.g. Dubai (DXB)')}
								{@render date(`legs.${i}.date`, 'Date', legs[i - 1]?.date || today, {
									get: () => leg.date,
									set: (v) => (leg.date = v)
								})}
							</div>
						</li>
					{/each}
				</ol>
				<FieldError id={id('legs-error')} message={errors.legs} />
				{#if legs.length < MAX_FLIGHT_LEGS}
					<button
						type="button"
						onclick={addLeg}
						class="border-forest-800/40 text-forest-800 hover:border-forest-800 hover:bg-forest-100 inline-flex items-center gap-2 rounded-full border border-dashed px-5 py-2.5 text-sm font-bold transition-colors"
					>
						<PlusIcon class="size-4" />Add flight
					</button>
				{:else}
					<p class="text-ink/60 text-sm">That's the maximum of {MAX_FLIGHT_LEGS} flights. Add any others in the notes below.</p>
				{/if}
			{:else}
				{@const leg = legs[0]}
				<div class="grid items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
					{@render place(leg, 0, 'from', 'From', 'e.g. Entebbe (EBB)')}
					<button
						type="button"
						onclick={() => swap(leg)}
						class="text-forest-800 hover:bg-forest-100 justify-self-center rounded-full p-2.5 transition-colors sm:mt-8"
						aria-label="Swap from and to"
						title="Swap from and to"
					>
						<ArrowLeftRightIcon class="size-4 rotate-90 sm:rotate-0" />
					</button>
					{@render place(leg, 0, 'to', 'To', 'e.g. Dubai (DXB)')}
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					{@render date('legs.0.date', 'Departure date', today, { get: () => leg.date, set: (v) => (leg.date = v) })}
					{#if tripType === 'RETURN'}
						{@render date('returnDate', 'Return date', leg.date || today, { get: () => returnDate, set: (v) => (returnDate = v) })}
					{/if}
				</div>
				<FieldError id={id('legs-error')} message={errors.legs} />
			{/if}

			<label class="text-forest-900 inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
				<input type="checkbox" name="flexibleDates" bind:checked={flexibleDates} class="accent-forest-800 size-4" />
				My dates are flexible (a few days either way for a better fare)
			</label>
		</section>

		<section class="border-forest-900/10 space-y-5 border-t pt-8" aria-labelledby={id('pax-title')}>
			<h3 id={id('pax-title')} class={sectionTitleClass}>Passengers</h3>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each paxRows as row (row.key)}
					<div class={cn('rounded-md border px-4 py-3', errors[row.key] ? 'border-crane-red' : 'border-forest-900/15')}>
						<label for={id(row.key)} class="text-forest-900 block text-sm font-semibold">{row.label}</label>
						<p class="text-ink/55 text-xs">{row.hint}</p>
						<div class="mt-2 flex items-center gap-2">
							<button
								type="button"
								onclick={() => (pax[row.key] = Math.max(row.min, pax[row.key] - 1))}
								disabled={pax[row.key] <= row.min}
								class="border-forest-900/15 text-forest-900 hover:border-forest-700 flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-35"
								aria-label="Fewer {row.label.toLowerCase()}"
							>
								<MinusIcon class="size-4" />
							</button>
							<input
								id={id(row.key)}
								name={row.key}
								type="number"
								inputmode="numeric"
								min={row.min}
								max="50"
								bind:value={pax[row.key]}
								aria-invalid={errors[row.key] ? true : undefined}
								aria-describedby={errors[row.key] ? id(`${row.key}-error`) : undefined}
								class="text-forest-950 w-12 [appearance:textfield] bg-transparent text-center text-lg font-bold outline-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
							<button
								type="button"
								onclick={() => (pax[row.key] = Math.min(50, pax[row.key] + 1))}
								class="border-forest-900/15 text-forest-900 hover:border-forest-700 flex size-9 items-center justify-center rounded-full border transition-colors"
								aria-label="More {row.label.toLowerCase()}"
							>
								<PlusIcon class="size-4" />
							</button>
						</div>
						<FieldError id={id(`${row.key}-error`)} message={errors[row.key]} />
					</div>
				{/each}
			</div>
		</section>

		<section class="border-forest-900/10 space-y-6 border-t pt-8" aria-labelledby={id('prefs-title')}>
			<div>
				<h3 id={id('prefs-title')} class={sectionTitleClass}>Preferences</h3>
				<p class="text-ink/60 mt-1 text-sm">Optional. Leave these open and we'll find the best value for you.</p>
			</div>

			<fieldset>
				<legend class="text-forest-900 mb-2 text-sm font-semibold">Cabin class</legend>
				<div class="flex flex-wrap gap-2">
					<label class={chipClass(cabin === '')}>
						<input type="radio" name="cabin" value="" bind:group={cabin} class="sr-only" />
						Any cabin
					</label>
					{#each CABIN_CLASSES as c (c)}
						<label class={chipClass(cabin === c)}>
							<input type="radio" name="cabin" value={c} bind:group={cabin} class="sr-only" />
							{cabinLabels[c]}
						</label>
					{/each}
				</div>
				<FieldError id={id('cabin-error')} message={errors.cabin} />
			</fieldset>

			<fieldset aria-describedby={id('airlines-hint')}>
				<legend class="text-forest-900 mb-1 text-sm font-semibold">Preferred airlines</legend>
				<p id={id('airlines-hint')} class="text-ink/60 mb-3 text-xs">
					Pick up to {MAX_AIRLINES} if you only want to fly with certain airlines.
				</p>
				<div class="flex flex-wrap gap-2">
					<button type="button" class={chipClass(airlines.length === 0)} aria-pressed={airlines.length === 0} onclick={() => (airlines = [])}>
						{#if airlines.length === 0}<CheckIcon class="size-3.5" />{/if}Any airline
					</button>
					{#each AIRLINES as airline (airline)}
						{@const checked = airlines.includes(airline)}
						{@const disabled = airlineLimitReached && !checked}
						<label class={chipClass(checked, disabled)}>
							<input type="checkbox" name="airlines" value={airline} bind:group={airlines} {disabled} class="sr-only" />
							{#if checked}<CheckIcon class="size-3.5" />{/if}{airline}
						</label>
					{/each}
				</div>
				<FieldError id={id('airlines-error')} message={errors.airlines} />
			</fieldset>
		</section>
	{/snippet}
</RequestFormShell>

<!--
	Labeled price tiers with UGX and USD amounts (both set by the business, no conversion).
	One tier can be marked as the "from" price shown on package cards.
-->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import type { PackagePriceInput } from '#lib/schemas/packages.js';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		value = $bindable([]),
		errors = {}
	}: { value?: PackagePriceInput[]; errors?: Record<string, string> } = $props();

	function add() {
		value = [...value, { label: '', amountUGX: null, amountUSD: null, isFromPrice: value.length === 0 }];
	}

	function remove(index: number) {
		const removedFrom = value[index].isFromPrice;
		const next = value.filter((_, i) => i !== index);
		if (removedFrom && next.length) next[0] = { ...next[0], isFromPrice: true };
		value = next;
	}

	function move(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= value.length) return;
		const next = [...value];
		[next[index], next[target]] = [next[target], next[index]];
		value = next;
	}

	function setFrom(index: number) {
		value = value.map((p, i) => ({ ...p, isFromPrice: i === index }));
	}

	const err = (index: number, field: string) => errors[`prices.${index}.${field}`];
</script>

<div class="space-y-3">
	{#each value as price, index (index)}
		<div class="rounded-lg border p-3">
			<div class="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
				<div>
					<label class="text-muted-foreground mb-1 block text-xs font-medium" for="price-label-{index}">Label</label>
					<Input
						id="price-label-{index}"
						bind:value={price.label}
						placeholder="e.g. Per person (2 pax)"
						maxlength={100}
						aria-invalid={err(index, 'label') ? true : undefined}
					/>
					{#if err(index, 'label')}<p class="text-destructive mt-1 text-xs">{err(index, 'label')}</p>{/if}
				</div>
				<div>
					<label class="text-muted-foreground mb-1 block text-xs font-medium" for="price-ugx-{index}">UGX</label>
					<Input
						id="price-ugx-{index}"
						type="number"
						min={0}
						step={1000}
						inputmode="numeric"
						bind:value={price.amountUGX}
						placeholder="3500000"
						aria-invalid={err(index, 'amountUGX') ? true : undefined}
					/>
					{#if err(index, 'amountUGX')}<p class="text-destructive mt-1 text-xs">{err(index, 'amountUGX')}</p>{/if}
				</div>
				<div>
					<label class="text-muted-foreground mb-1 block text-xs font-medium" for="price-usd-{index}">USD</label>
					<Input
						id="price-usd-{index}"
						type="number"
						min={0}
						step={1}
						inputmode="numeric"
						bind:value={price.amountUSD}
						placeholder="950"
						aria-invalid={err(index, 'amountUSD') ? true : undefined}
					/>
					{#if err(index, 'amountUSD')}<p class="text-destructive mt-1 text-xs">{err(index, 'amountUSD')}</p>{/if}
				</div>
			</div>
			<div class="mt-2 flex items-center justify-between gap-2">
				<label class="flex items-center gap-2 text-sm">
					<input
						type="radio"
						name="from-price"
						class="accent-primary"
						checked={price.isFromPrice}
						onchange={() => setFrom(index)}
					/>
					Show as "From" price on cards
				</label>
				<div class="flex">
					<Button type="button" size="icon-sm" variant="ghost" disabled={index === 0} onclick={() => move(index, -1)} aria-label="Move up">
						<ArrowUpIcon />
					</Button>
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						disabled={index === value.length - 1}
						onclick={() => move(index, 1)}
						aria-label="Move down"
					>
						<ArrowDownIcon />
					</Button>
					<Button type="button" size="icon-sm" variant="ghost" onclick={() => remove(index)} aria-label="Remove price">
						<XIcon />
					</Button>
				</div>
			</div>
		</div>
	{/each}
	{#if errors.prices}<p class="text-destructive text-sm">{errors.prices}</p>{/if}
	<Button type="button" variant="outline" size="sm" onclick={add}>
		<PlusIcon data-icon="inline-start" />
		Add price
	</Button>
</div>

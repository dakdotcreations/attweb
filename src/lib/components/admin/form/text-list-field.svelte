<!-- Editable, ordered list of short text items (highlights, inclusions, exclusions). -->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import { tick } from 'svelte';

	let {
		value = $bindable([]),
		placeholder = '',
		addLabel = 'Add item',
		/** Field errors keyed by index, e.g. { 0: 'Required' } */
		errors = {}
	}: {
		value?: string[];
		placeholder?: string;
		addLabel?: string;
		errors?: Record<number, string | undefined>;
	} = $props();

	// Look inputs up in the DOM rather than binding refs into an array:
	// `bind:ref={arr[i]}` is undefined for new rows, which Svelte rejects (props_invalid_value).
	let container = $state<HTMLDivElement>();
	const focusRow = (index: number) =>
		container?.querySelector<HTMLInputElement>(`[data-row="${index}"]`)?.focus();

	async function add() {
		value = [...value, ''];
		await tick();
		focusRow(value.length - 1);
	}

	function move(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= value.length) return;
		const next = [...value];
		[next[index], next[target]] = [next[target], next[index]];
		value = next;
	}

	function onKeydown(event: KeyboardEvent, index: number) {
		// Enter on the last item adds a new one, like a list editor.
		if (event.key === 'Enter') {
			event.preventDefault();
			if (index === value.length - 1) void add();
			else focusRow(index + 1);
		}
	}
</script>

<div class="space-y-2" bind:this={container}>
	{#each value as _, index (index)}
		<div class="flex items-start gap-2">
			<div class="flex-1">
				<Input
					data-row={index}
					bind:value={value[index]}
					{placeholder}
					maxlength={200}
					aria-invalid={errors[index] ? true : undefined}
					onkeydown={(e) => onKeydown(e, index)}
				/>
				{#if errors[index]}
					<p class="text-destructive mt-1 text-xs">{errors[index]}</p>
				{/if}
			</div>
			<Button type="button" size="icon" variant="ghost" disabled={index === 0} onclick={() => move(index, -1)} aria-label="Move up">
				<ArrowUpIcon />
			</Button>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				disabled={index === value.length - 1}
				onclick={() => move(index, 1)}
				aria-label="Move down"
			>
				<ArrowDownIcon />
			</Button>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				onclick={() => (value = value.filter((_, i) => i !== index))}
				aria-label="Remove"
			>
				<XIcon />
			</Button>
		</div>
	{/each}
	<Button type="button" variant="outline" size="sm" onclick={add}>
		<PlusIcon data-icon="inline-start" />
		{addLabel}
	</Button>
</div>

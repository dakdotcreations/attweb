<!-- Title row for dashboard pages, with an optional actions slot (e.g. "New package"). -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		actions
	}: { title: string; description?: string; actions?: Snippet } = $props();
</script>

<svelte:head>
	<title>{title} · Altura Admin</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-start justify-between gap-4">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
		{#if description}
			<p class="text-muted-foreground mt-1 text-sm">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex items-center gap-2">{@render actions()}</div>
	{/if}
</div>

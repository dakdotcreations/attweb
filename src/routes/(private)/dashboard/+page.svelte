<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Dashboard · Altura</title>
</svelte:head>

<h1 class="text-2xl font-semibold">Welcome, {data.user.name}</h1>
<p class="text-muted-foreground mt-1">The dashboard overview is built in Phase 2.</p>

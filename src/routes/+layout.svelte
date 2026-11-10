<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/webp" href="/brand/logo-mark.webp" />
	<link rel="apple-touch-icon" href="/brand/logo-mark.webp" />
</svelte:head>

{@render children()}

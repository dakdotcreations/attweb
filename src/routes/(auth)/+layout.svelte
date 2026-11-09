<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<main class="bg-muted/40 flex min-h-svh items-center justify-center p-4">
	<div class="w-full max-w-sm">
		{@render children()}
	</div>
</main>

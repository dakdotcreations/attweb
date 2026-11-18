<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';

	let { status }: { status: 'DRAFT' | 'PUBLISHED' } = $props();
</script>

{#if status === 'PUBLISHED'}
	<Badge>Published</Badge>
{:else}
	<Badge variant="secondary">Draft</Badge>
{/if}

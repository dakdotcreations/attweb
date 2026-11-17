<script lang="ts">
	import AirlineForm from '#lib/components/admin/airlines/airline-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Re-create the form when switching records (e.g. after "new" redirects to the saved id). -->
{#key data.airline?.id ?? 'new'}
	<AirlineForm airline={data.airline} />
{/key}

<script lang="ts">
	import ServiceForm from '#lib/components/admin/services/service-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Re-create the form when switching records (e.g. after "new" redirects to the saved id). -->
{#key data.service?.id ?? 'new'}
	<ServiceForm service={data.service} publishedInstitutions={data.publishedInstitutions} />
{/key}

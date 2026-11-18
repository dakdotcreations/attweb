<script lang="ts">
	import InstitutionForm from '#lib/components/admin/institutions/institution-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Re-create the form when switching records (e.g. after "new" redirects to the saved id). -->
{#key data.institution?.id ?? 'new'}
	<InstitutionForm institution={data.institution} countries={data.countries} canViewInquiries={data.canViewInquiries} />
{/key}

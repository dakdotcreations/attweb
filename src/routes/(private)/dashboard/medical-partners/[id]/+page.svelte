<script lang="ts">
	import MedicalPartnerForm from '#lib/components/admin/medical-partners/medical-partner-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Re-create the form when switching records (e.g. after "new" redirects to the saved id). -->
{#key data.partner?.id ?? 'new'}
	<MedicalPartnerForm partner={data.partner} countries={data.countries} />
{/key}

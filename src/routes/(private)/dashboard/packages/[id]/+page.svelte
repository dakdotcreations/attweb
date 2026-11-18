<script lang="ts">
	import PackageForm from '#lib/components/admin/packages/package-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.pkg?.id ?? 'new'}
	<PackageForm pkg={data.pkg} services={data.services} />
{/key}

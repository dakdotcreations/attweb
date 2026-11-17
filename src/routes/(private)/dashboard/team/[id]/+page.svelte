<script lang="ts">
	import TeamMemberForm from '#lib/components/admin/team/team-member-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Re-create the form when switching records (e.g. after "new" redirects to the saved id). -->
{#key data.member?.id ?? 'new'}
	<TeamMemberForm member={data.member} />
{/key}

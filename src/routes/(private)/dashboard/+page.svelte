<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { navForRole } from '#lib/components/admin/nav.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Quick links to every section this user can access (stats come in later phases).
	const sections = $derived(
		navForRole(data.user.role)
			.flatMap((group) => group.items)
			.filter((item) => item.href !== '/dashboard')
	);
	const firstName = $derived(data.user.name.split(' ')[0] || data.user.email);
</script>

<PageHeader title="Dashboard" description="Welcome back, {firstName}." />

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
	{#each sections as section (section.href)}
		<a href={section.href} class="group rounded-xl focus-visible:outline-none">
			<Card.Root class="group-hover:bg-muted/50 group-focus-visible:ring-ring h-full transition-colors group-focus-visible:ring-2">
				<Card.Header class="flex flex-row items-center gap-3">
					<div class="bg-primary/10 text-primary rounded-lg p-2">
						<section.icon class="size-5" />
					</div>
					<Card.Title>{section.title}</Card.Title>
				</Card.Header>
			</Card.Root>
		</a>
	{/each}
</div>

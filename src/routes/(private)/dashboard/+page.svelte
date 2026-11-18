<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { navForRole } from '#lib/components/admin/nav.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { formatRelative } from '#lib/format.js';
	import { sourceLabels } from '#lib/inquiries.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sections = $derived(
		navForRole(data.user.role)
			.flatMap((group) => group.items)
			.filter((item) => item.href !== '/dashboard')
	);
	const firstName = $derived(data.user.name.split(' ')[0] || data.user.email);
	const newCount = $derived(data.navBadges['/dashboard/inquiries'] ?? 0);
</script>

<PageHeader title="Dashboard" description="Welcome back, {firstName}." />

{#if data.newInquiries}
	<Card.Root class="mb-6">
		<Card.Header class="flex flex-row items-center justify-between gap-4">
			<div>
				<Card.Title>New inquiries</Card.Title>
				<Card.Description>
					{newCount === 0 ? 'All caught up.' : `${newCount} waiting for a reply.`}
				</Card.Description>
			</div>
			<Button href="/dashboard/inquiries?status=NEW" variant="outline" size="sm">View all</Button>
		</Card.Header>
		{#if data.newInquiries.length > 0}
			<Card.Content>
				<ul class="divide-y">
					{#each data.newInquiries as inquiry (inquiry.id)}
						<li>
							<a
								href="/dashboard/inquiries/{inquiry.id}"
								class="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-4 rounded-md px-2 py-2.5"
							>
								<span class="min-w-0">
									<span class="font-medium">{inquiry.name}</span>
									<span class="text-muted-foreground block truncate text-sm">{inquiry.interest ?? 'General inquiry'}</span>
								</span>
								<span class="text-muted-foreground shrink-0 text-right text-xs">
									{formatRelative(inquiry.createdAt)}
									<span class="block">{sourceLabels[inquiry.source]}</span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</Card.Content>
		{/if}
	</Card.Root>
{/if}

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

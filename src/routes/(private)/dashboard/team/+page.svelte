<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UserIcon from '@lucide/svelte/icons/user';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const shown = $derived(data.members.filter((m) => m.status === 'PUBLISHED' && m.photo).length);
</script>

<PageHeader title="Team" description="The people clients meet, shown on the About page.">
	{#snippet actions()}
		<Button href="/dashboard/team/new">
			<PlusIcon data-icon="inline-start" />
			New team member
		</Button>
	{/snippet}
</PageHeader>

{#if data.members.length > 0 && shown === 0}
	<p class="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200" role="status">
		<strong>The team section on the About page is hidden.</strong> It only shows published members who have a photo.
	</p>
{/if}

{#if data.members.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No team members yet. The About page hides the team section until someone is published with a photo.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.members as member (member.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded">
								{#if member.photo}
									<img src={member.photo.thumbUrl} alt="" class="size-full object-cover" />
								{:else}
									<UserIcon class="text-muted-foreground size-5" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/team/{member.id}" class="font-medium after:absolute after:inset-0">{member.name}</a>
							{#if !member.photo}<span class="text-muted-foreground block text-xs">No photo, so not shown on the site</span>{/if}
						</Table.Cell>
						<Table.Cell>{member.role}</Table.Cell>
						<Table.Cell><StatusBadge status={member.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{member.sortOrder}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(member.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

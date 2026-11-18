<script lang="ts">
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import UserDialog from '#lib/components/admin/users/user-dialog.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type User = (typeof data.users)[number];
	let dialogOpen = $state(false);
	let editing = $state<User | null>(null);
	let notice = $state<string | null>(null);

	function openDialog(user: User | null) {
		editing = user;
		dialogOpen = true;
	}
</script>

<PageHeader title="Users" description="People who can sign in to this dashboard. There is no public sign-up.">
	{#snippet actions()}
		<Button onclick={() => openDialog(null)}>
			<PlusIcon data-icon="inline-start" />
			Add user
		</Button>
	{/snippet}
</PageHeader>

{#if notice}
	<div class="bg-muted mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm" role="status">
		<CheckIcon class="size-4 text-green-600" />
		{notice}
	</div>
{/if}

<div class="overflow-x-auto rounded-lg border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Name</Table.Head>
				<Table.Head>Role</Table.Head>
				<Table.Head>Last active</Table.Head>
				<Table.Head>Added</Table.Head>
				<Table.Head class="text-right"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.users as user (user.id)}
				{@const isSelf = user.id === data.meId}
				<Table.Row>
					<Table.Cell>
						<div class="font-medium">
							{user.name || '—'}
							{#if isSelf}<span class="text-muted-foreground text-xs font-normal">(you)</span>{/if}
						</div>
						<div class="text-muted-foreground text-xs">{user.email}</div>
					</Table.Cell>
					<Table.Cell>
						<Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
							{user.role === 'ADMIN' ? 'Admin' : 'Editor'}
						</Badge>
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">
						{user.lastActiveAt ? formatDate(user.lastActiveAt) : 'Never signed in'}
					</Table.Cell>
					<Table.Cell class="text-muted-foreground text-sm">{formatDate(user.createdAt)}</Table.Cell>
					<Table.Cell class="text-right">
						<div class="flex justify-end gap-2">
							<Button variant="outline" size="sm" onclick={() => openDialog(user)}>Edit</Button>
							{#if !isSelf}
								<DeleteButton
									label="Remove"
									title="Remove {user.name || user.email}?"
									description="They will be signed out and can no longer access the dashboard. Content they created is kept."
									fields={{ id: user.id }}
								/>
							{/if}
						</div>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>

<UserDialog
	bind:open={dialogOpen}
	user={editing}
	isSelf={editing?.id === data.meId}
	onDone={(message) => (notice = message)}
/>

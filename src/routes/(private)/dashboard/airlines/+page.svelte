<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHeader
	title="Airlines"
	description="Airlines visitors can pick on the flight request form. Published airlines are also listed on the About page."
>
	{#snippet actions()}
		<Button href="/dashboard/airlines/new">
			<PlusIcon data-icon="inline-start" />
			New airline
		</Button>
	{/snippet}
</PageHeader>

{#if data.airlines.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No airlines yet. The flight request form still works, with "Any airline" as the only choice.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.airlines as airline (airline.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded">
								{#if airline.logo}
									<img src={airline.logo.thumbUrl} alt="" class="size-full object-contain" />
								{:else}
									<PlaneIcon class="text-muted-foreground size-5" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/airlines/{airline.id}" class="font-medium after:absolute after:inset-0">{airline.name}</a>
						</Table.Cell>
						<Table.Cell><StatusBadge status={airline.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{airline.sortOrder}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(airline.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHeader
	title="Services"
	description="Business lines shown on the website. Services also tag tour packages."
>
	{#snippet actions()}
		<Button href="/dashboard/services/new">
			<PlusIcon data-icon="inline-start" />
			New service
		</Button>
	{/snippet}
</PageHeader>

{#if data.services.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No services yet. Start with your main offerings, e.g. Guided Wildlife Tours and Gorilla Trekking.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Packages</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.services as service (service.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted size-10 overflow-hidden rounded">
								{#if service.coverImage}
									<img src={service.coverImage.thumbUrl} alt="" class="size-full object-cover" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<!-- Stretched link makes the whole row clickable. -->
							<a href="/dashboard/services/{service.id}" class="font-medium after:absolute after:inset-0">
								{service.name}
							</a>
							<div class="text-muted-foreground text-xs">/services/{service.slug}</div>
						</Table.Cell>
						<Table.Cell><StatusBadge status={service.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{service._count.packages}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{service.sortOrder}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(service.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

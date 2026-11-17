<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import HospitalIcon from '@lucide/svelte/icons/hospital';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHeader title="Medical Partners" description="Hospitals, clinics and medical institutions visitors can choose on the medical tourism request form.">
	{#snippet actions()}
		<Button href="/dashboard/medical-partners/new">
			<PlusIcon data-icon="inline-start" />
			New partner
		</Button>
	{/snippet}
</PageHeader>

{#if data.partners.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No medical partners yet. Add them here, then set the Medical Tourism service's request form to "Medical tourism form".
		The form works without partners; visitors just won't be able to pick a hospital.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Country</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.partners as partner (partner.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded">
								{#if partner.logo}
									<img src={partner.logo.thumbUrl} alt="" class="size-full object-contain" />
								{:else}
									<HospitalIcon class="text-muted-foreground size-5" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/medical-partners/{partner.id}" class="font-medium after:absolute after:inset-0">{partner.name}</a>
						</Table.Cell>
						<Table.Cell>{partner.country}</Table.Cell>
						<Table.Cell><StatusBadge status={partner.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{partner.sortOrder}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(partner.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

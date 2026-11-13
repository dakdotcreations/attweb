<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHeader
	title="Partner Institutions"
	description="Universities and colleges students can choose on the study abroad request form."
>
	{#snippet actions()}
		<Button href="/dashboard/institutions/new">
			<PlusIcon data-icon="inline-start" />
			New institution
		</Button>
	{/snippet}
</PageHeader>

{#if data.institutions.length > 0 && !data.institutions.some((i) => i.status === 'PUBLISHED')}
	<p class="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200" role="status">
		<strong>The study abroad form is hidden.</strong> All institutions are drafts, so students see the general inquiry form instead.
		Open an institution and set its status to Published.
	</p>
{/if}

{#if data.institutions.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No partner institutions yet. Add them here, then set a service's request form to "Study abroad form".
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
					<Table.Head class="text-right">Requests</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.institutions as inst (inst.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted flex size-10 items-center justify-center overflow-hidden rounded">
								{#if inst.logo}
									<img src={inst.logo.thumbUrl} alt="" class="size-full object-contain" />
								{:else}
									<GraduationCapIcon class="text-muted-foreground size-5" />
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/institutions/{inst.id}" class="font-medium after:absolute after:inset-0">{inst.name}</a>
						</Table.Cell>
						<Table.Cell>{inst.country}</Table.Cell>
						<Table.Cell><StatusBadge status={inst.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{inst._count.inquiries}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{inst.sortOrder}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(inst.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

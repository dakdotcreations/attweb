<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate, formatDuration, formatMoney } from '#lib/format.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import StarIcon from '@lucide/svelte/icons/star';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let q = $state('');
	let serviceId = $state('');
	$effect.pre(() => {
		q = data.q;
		serviceId = data.serviceId;
	});

	function apply() {
		const params = new URLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (serviceId) params.set('service', serviceId);
		goto(params.size ? `?${params}` : '/dashboard/packages', { replace: true, reset: false });
	}

	let timer: ReturnType<typeof setTimeout>;
	const serviceLabel = $derived(data.services.find((s) => s.id === serviceId)?.name ?? 'All services');
</script>

<PageHeader title="Tour packages" description="Packages with pricing, highlights and galleries.">
	{#snippet actions()}
		<Button href="/dashboard/packages/new">
			<PlusIcon data-icon="inline-start" />
			New package
		</Button>
	{/snippet}
</PageHeader>

<div class="mb-4 flex flex-wrap gap-3">
	<Input
		type="search"
		placeholder="Search packages…"
		class="max-w-xs"
		bind:value={q}
		oninput={() => {
			clearTimeout(timer);
			timer = setTimeout(apply, 300);
		}}
	/>
	<Select.Root type="single" bind:value={serviceId} onValueChange={apply}>
		<Select.Trigger class="w-56">{serviceLabel}</Select.Trigger>
		<Select.Content>
			<Select.Item value="" label="All services" />
			{#each data.services as service (service.id)}
				<Select.Item value={service.id} label={service.name} />
			{/each}
		</Select.Content>
	</Select.Root>
</div>

{#if data.packages.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		{data.q || data.serviceId ? 'No packages match these filters.' : 'No packages yet.'}
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Package</Table.Head>
					<Table.Head>Services</Table.Head>
					<Table.Head>From</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Updated</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.packages as pkg (pkg.id)}
					{@const from = pkg.prices[0]}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted size-10 overflow-hidden rounded">
								{#if pkg.coverImage}<img src={pkg.coverImage.thumbUrl} alt="" class="size-full object-cover" />{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/packages/{pkg.id}" class="font-medium after:absolute after:inset-0">
								{pkg.title}
							</a>
							{#if pkg.featured}<StarIcon class="ml-1 inline size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />{/if}
							<div class="text-muted-foreground text-xs">{formatDuration(pkg.durationDays, pkg.durationNights)}</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-wrap gap-1">
								{#each pkg.services as { service } (service.id)}
									<Badge variant="outline">{service.name}</Badge>
								{/each}
							</div>
						</Table.Cell>
						<Table.Cell class="text-sm whitespace-nowrap">
							{#if from}
								<div>{formatMoney(from.amountUSD, 'USD')}</div>
								<div class="text-muted-foreground text-xs">{formatMoney(from.amountUGX, 'UGX')}</div>
							{:else}
								<span class="text-muted-foreground">No price</span>
							{/if}
						</Table.Cell>
						<Table.Cell><StatusBadge status={pkg.status} /></Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">{formatDate(pkg.updatedAt)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<script lang="ts">
	import { goto } from '$app/navigation';
	import InquiryStatusBadge from '#lib/components/admin/inquiries/inquiry-status-badge.svelte';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDateOnly, formatRelative } from '#lib/format.js';
	import { INQUIRY_KINDS, INQUIRY_SOURCES, INQUIRY_STATUSES, kindLabels, sourceLabels, statusMeta } from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let q = $state('');
	let serviceId = $state('');
	let source = $state('');
	let kind = $state('');
	let institutionId = $state('');
	$effect.pre(() => {
		q = data.filters.q;
		serviceId = data.filters.serviceId;
		source = data.filters.source;
		kind = data.filters.kind;
		institutionId = data.filters.institutionId;
	});

	function href(overrides: Record<string, string | number> = {}) {
		const values: Record<string, string | number> = {
			q: q.trim(),
			service: serviceId,
			source,
			kind,
			institution: institutionId,
			status: data.filters.status,
			...overrides
		};
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(values)) {
			if (value && !(key === 'page' && value === 1)) params.set(key, String(value));
		}
		return params.size ? `?${params}` : '/dashboard/inquiries';
	}

	const apply = () => goto(href(), { replace: true, reset: false });
	let timer: ReturnType<typeof setTimeout>;

	const tabs = $derived([
		{ value: '', label: 'All', count: data.allCount },
		...INQUIRY_STATUSES.map((s) => ({ value: s, label: statusMeta[s].label, count: data.counts[s] }))
	]);
	const serviceLabel = $derived(data.services.find((s) => s.id === serviceId)?.name ?? 'All services');
	const sourceLabel = $derived(source ? sourceLabels[source as keyof typeof sourceLabels] : 'All sources');
	const kindLabel = $derived(kind ? kindLabels[kind as keyof typeof kindLabels] : 'All request types');
	const institutionLabel = $derived(data.institutions.find((i) => i.id === institutionId)?.name ?? 'All institutions');
	const hasFilters = $derived(
		!!(data.filters.q || data.filters.serviceId || data.filters.source || data.filters.kind || data.filters.institutionId)
	);
</script>

<PageHeader title="Inquiries" description="Leads from the website and those logged by the team.">
	{#snippet actions()}
		<Button href="/dashboard/inquiries/new" variant="outline">
			<PlusIcon data-icon="inline-start" />
			Log inquiry
		</Button>
	{/snippet}
</PageHeader>

<nav class="mb-4 flex gap-1 overflow-x-auto border-b" aria-label="Filter by status">
	{#each tabs as tab (tab.value)}
		{@const active = data.filters.status === tab.value}
		<a
			href={href({ status: tab.value, page: 1 })}
			data-sveltekit-replacestate
			class={cn(
				'-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm',
				active ? 'border-primary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground border-transparent'
			)}
			aria-current={active ? 'page' : undefined}
		>
			{tab.label}
			<span class="bg-muted rounded-full px-1.5 text-xs tabular-nums">{tab.count}</span>
		</a>
	{/each}
</nav>

<div class="mb-4 flex flex-wrap gap-3">
	<Input
		type="search"
		placeholder="Search name, email, phone, #number…"
		class="max-w-xs"
		bind:value={q}
		oninput={() => {
			clearTimeout(timer);
			timer = setTimeout(apply, 300);
		}}
	/>
	<Select.Root type="single" bind:value={serviceId} onValueChange={apply}>
		<Select.Trigger class="w-52">{serviceLabel}</Select.Trigger>
		<Select.Content>
			<Select.Item value="" label="All services" />
			{#each data.services as s (s.id)}<Select.Item value={s.id} label={s.name} />{/each}
		</Select.Content>
	</Select.Root>
	<Select.Root type="single" bind:value={source} onValueChange={apply}>
		<Select.Trigger class="w-40">{sourceLabel}</Select.Trigger>
		<Select.Content>
			<Select.Item value="" label="All sources" />
			{#each INQUIRY_SOURCES as s (s)}<Select.Item value={s} label={sourceLabels[s]} />{/each}
		</Select.Content>
	</Select.Root>
	<Select.Root type="single" bind:value={kind} onValueChange={apply}>
		<Select.Trigger class="w-48">{kindLabel}</Select.Trigger>
		<Select.Content>
			<Select.Item value="" label="All request types" />
			{#each INQUIRY_KINDS as k (k)}<Select.Item value={k} label={kindLabels[k]} />{/each}
		</Select.Content>
	</Select.Root>
	{#if data.institutions.length && (kind === 'STUDY_ABROAD' || institutionId)}
		<Select.Root type="single" bind:value={institutionId} onValueChange={apply}>
			<Select.Trigger class="w-56">{institutionLabel}</Select.Trigger>
			<Select.Content>
				<Select.Item value="" label="All institutions" />
				{#each data.institutions as i (i.id)}<Select.Item value={i.id} label={`${i.name} (${i.country})`} />{/each}
			</Select.Content>
		</Select.Root>
	{/if}
</div>

{#if data.items.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		{#if data.allCount === 0 && !hasFilters}
			No inquiries yet. Website inquiries will appear here, and you can log WhatsApp or phone leads with
			<span class="text-foreground font-medium">Log inquiry</span>.
		{:else}
			No inquiries match these filters.
		{/if}
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-20">#</Table.Head>
					<Table.Head>From</Table.Head>
					<Table.Head>Interested in</Table.Head>
					<Table.Head>Travel</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Received</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.items as inquiry (inquiry.id)}
					<Table.Row class={cn('relative', inquiry.status === 'NEW' && 'font-medium')}>
						<Table.Cell class="text-muted-foreground tabular-nums">#{inquiry.number}</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/inquiries/{inquiry.id}" class="after:absolute after:inset-0">{inquiry.name}</a>
							<div class="text-muted-foreground text-xs font-normal">
								{[inquiry.email, inquiry.phone].filter(Boolean).join(' · ')}
							</div>
						</Table.Cell>
						<Table.Cell class="max-w-64 truncate font-normal">
							{#if inquiry.kind === 'FLIGHT'}
								<PlaneIcon class="text-muted-foreground mr-1 inline size-3.5 align-[-2px]" aria-label={kindLabels.FLIGHT} />
							{:else if inquiry.kind === 'STUDY_ABROAD'}
								<GraduationCapIcon class="text-muted-foreground mr-1 inline size-3.5 align-[-2px]" aria-label={kindLabels.STUDY_ABROAD} />
							{/if}
							{inquiry.package?.title ?? inquiry.interest ?? inquiry.service?.name ?? '—'}
						</Table.Cell>
						<Table.Cell class="text-muted-foreground text-sm font-normal whitespace-nowrap">
							{inquiry.travelDate ? formatDateOnly(inquiry.travelDate) : ''}
							{#if inquiry.groupSize}<span class="block text-xs">{inquiry.groupSize} people</span>{/if}
						</Table.Cell>
						<Table.Cell><InquiryStatusBadge status={inquiry.status} /></Table.Cell>
						<Table.Cell class="text-muted-foreground text-right text-sm font-normal whitespace-nowrap">
							{formatRelative(inquiry.createdAt)}
							<span class="block text-xs">{sourceLabels[inquiry.source]}</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#if data.pageCount > 1}
		<div class="mt-6 flex items-center justify-center gap-2 text-sm">
			<Button variant="outline" size="sm" href={href({ page: data.page - 1 })} disabled={data.page <= 1}>Previous</Button>
			<span class="text-muted-foreground">Page {data.page} of {data.pageCount} · {data.total} inquiries</span>
			<Button variant="outline" size="sm" href={href({ page: data.page + 1 })} disabled={data.page >= data.pageCount}>
				Next
			</Button>
		</div>
	{/if}
{/if}

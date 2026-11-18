<script lang="ts">
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import StarIcon from '@lucide/svelte/icons/star';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageHeader title="Testimonials" description="What customers say about Altura.">
	{#snippet actions()}
		<Button href="/dashboard/testimonials/new">
			<PlusIcon data-icon="inline-start" />
			New testimonial
		</Button>
	{/snippet}
</PageHeader>

{#if data.testimonials.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		No testimonials yet.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Customer</Table.Head>
					<Table.Head>Quote</Table.Head>
					<Table.Head>For</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Order</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.testimonials as t (t.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="flex items-center gap-3">
								<Avatar.Root class="size-9">
									{#if t.photo}<Avatar.Image src={t.photo.thumbUrl} alt="" />{/if}
									<Avatar.Fallback>{t.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
								</Avatar.Root>
								<div>
									<a href="/dashboard/testimonials/{t.id}" class="font-medium after:absolute after:inset-0">{t.name}</a>
									{#if t.featured}<StarIcon class="ml-1 inline size-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />{/if}
									<div class="text-muted-foreground text-xs">{t.location ?? ''}</div>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="max-w-md">
							<p class="text-muted-foreground line-clamp-2 text-sm whitespace-normal">“{t.quote}”</p>
							{#if t.rating}<p class="text-xs text-amber-600">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</p>{/if}
						</Table.Cell>
						<Table.Cell class="text-sm">{t.package?.title ?? t.service?.name ?? ''}</Table.Cell>
						<Table.Cell><StatusBadge status={t.status} /></Table.Cell>
						<Table.Cell class="text-right tabular-nums">{t.sortOrder}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

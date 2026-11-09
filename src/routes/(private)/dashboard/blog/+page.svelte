<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import StatusBadge from '#lib/components/admin/status-badge.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import { formatDate } from '#lib/format.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let q = $state('');
	let status = $state('');
	$effect.pre(() => {
		q = data.q;
		status = data.status;
	});

	function apply() {
		const params = new URLSearchParams();
		if (q.trim()) params.set('q', q.trim());
		if (status) params.set('status', status);
		goto(params.size ? `?${params}` : '/dashboard/blog', { replace: true, reset: false });
	}

	let timer: ReturnType<typeof setTimeout>;
	const statusLabels: Record<string, string> = { '': 'All posts', DRAFT: 'Drafts', PUBLISHED: 'Published' };
</script>

<PageHeader title="Blog" description="Guides and articles that bring visitors in from search engines.">
	{#snippet actions()}
		<Button href="/dashboard/blog/new">
			<PlusIcon data-icon="inline-start" />
			New post
		</Button>
	{/snippet}
</PageHeader>

<div class="mb-4 flex flex-wrap gap-3">
	<Input
		type="search"
		placeholder="Search posts…"
		class="max-w-xs"
		bind:value={q}
		oninput={() => {
			clearTimeout(timer);
			timer = setTimeout(apply, 300);
		}}
	/>
	<Select.Root type="single" bind:value={status} onValueChange={apply}>
		<Select.Trigger class="w-40">{statusLabels[status]}</Select.Trigger>
		<Select.Content>
			{#each Object.entries(statusLabels) as [value, label] (value)}
				<Select.Item {value} {label} />
			{/each}
		</Select.Content>
	</Select.Root>
</div>

{#if data.posts.length === 0}
	<div class="text-muted-foreground rounded-xl border border-dashed py-16 text-center text-sm">
		{data.q || data.status ? 'No posts match these filters.' : 'No posts yet. Gorilla trekking and visa guides are a good start.'}
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-16"></Table.Head>
					<Table.Head>Title</Table.Head>
					<Table.Head>Service</Table.Head>
					<Table.Head>Author</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Published</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.posts as post (post.id)}
					<Table.Row class="relative">
						<Table.Cell>
							<div class="bg-muted size-10 overflow-hidden rounded">
								{#if post.coverImage}<img src={post.coverImage.thumbUrl} alt="" class="size-full object-cover" />{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<a href="/dashboard/blog/{post.id}" class="font-medium after:absolute after:inset-0">{post.title}</a>
							<div class="text-muted-foreground text-xs">/blog/{post.slug}</div>
						</Table.Cell>
						<Table.Cell class="text-sm">{post.service?.name ?? ''}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-sm">{post.author?.name || post.author?.email || ''}</Table.Cell>
						<Table.Cell><StatusBadge status={post.status} /></Table.Cell>
						<Table.Cell class="text-muted-foreground text-right">
							{post.publishedAt ? formatDate(post.publishedAt) : '—'}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

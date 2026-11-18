<!-- Status changer + notes timeline for one inquiry. -->
<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { formatDateTime, formatRelative } from '#lib/format.js';
	import { INQUIRY_STATUSES, statusMeta, type InquiryStatus } from '#lib/inquiries.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import InquiryStatusBadge from './inquiry-status-badge.svelte';

	type Note = {
		id: string;
		kind: 'NOTE' | 'STATUS_CHANGE';
		body: string;
		fromStatus: InquiryStatus | null;
		toStatus: InquiryStatus | null;
		createdAt: Date;
		author: { name: string; email: string } | null;
	};

	let { status, notes }: { status: InquiryStatus; notes: Note[] } = $props();

	// svelte-ignore state_referenced_locally
	let nextStatus = $state<InquiryStatus>(status);
	let statusNote = $state('');
	let noteBody = $state('');
	let busy = $state<'status' | 'note' | null>(null);
	let error = $state<string | null>(null);

	// Keep the select in sync after a successful update reloads the data.
	$effect.pre(() => {
		nextStatus = status;
	});

	const submit =
		(kind: 'status' | 'note'): SubmitFunction =>
		() => {
			busy = kind;
			error = null;
			return async ({ result, update }) => {
				busy = null;
				if (result.type === 'failure') {
					const errors = (result.data?.errors ?? {}) as Record<string, string>;
					error = Object.values(errors)[0] ?? (result.data?.message as string) ?? 'Something went wrong.';
					return;
				}
				if (kind === 'status') statusNote = '';
				else noteBody = '';
				await update({ reset: false });
			};
		};
</script>

<Card.Root>
	<Card.Header><Card.Title>Status</Card.Title></Card.Header>
	<Card.Content>
		<form method="POST" action="?/status" use:enhance={submit('status')} class="space-y-3">
			<Select.Root type="single" name="status" bind:value={nextStatus}>
				<Select.Trigger class="w-full">
					<InquiryStatusBadge status={nextStatus} />
					<span class="text-muted-foreground ml-1 truncate text-xs">{statusMeta[nextStatus].description}</span>
				</Select.Trigger>
				<Select.Content>
					{#each INQUIRY_STATUSES as s (s)}
						<Select.Item value={s} label={statusMeta[s].label}>
							<InquiryStatusBadge status={s} />
							<span class="text-muted-foreground text-xs">{statusMeta[s].description}</span>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if nextStatus !== status}
				<Textarea name="note" bind:value={statusNote} rows={2} maxlength={5000} placeholder="Add a note (optional), e.g. quote sent for 4 people" />
				<Button type="submit" class="w-full" disabled={busy === 'status'}>
					{busy === 'status' ? 'Updating…' : `Mark as ${statusMeta[nextStatus].label}`}
				</Button>
			{/if}
		</form>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header><Card.Title>Activity</Card.Title></Card.Header>
	<Card.Content class="space-y-5">
		<form method="POST" action="?/note" use:enhance={submit('note')} class="space-y-2">
			<Textarea name="body" bind:value={noteBody} rows={3} maxlength={5000} placeholder="Add an internal note: calls, quotes, follow-ups…" />
			<div class="flex justify-end">
				<Button type="submit" size="sm" disabled={busy === 'note' || !noteBody.trim()}>
					{busy === 'note' ? 'Adding…' : 'Add note'}
				</Button>
			</div>
		</form>
		{#if error}<p class="text-destructive text-sm" role="alert">{error}</p>{/if}

		{#if notes.length === 0}
			<p class="text-muted-foreground text-sm">No activity yet.</p>
		{:else}
			<ol class="space-y-4 border-l pl-4">
				{#each notes as note (note.id)}
					<li class="relative">
						<span class="bg-border absolute top-1.5 -left-[1.3rem] size-2 rounded-full ring-4 ring-[var(--card)]"></span>
						{#if note.kind === 'STATUS_CHANGE' && note.fromStatus && note.toStatus}
							<div class="flex flex-wrap items-center gap-1.5 text-sm">
								<InquiryStatusBadge status={note.fromStatus} />
								<ArrowRightIcon class="text-muted-foreground size-3.5" />
								<InquiryStatusBadge status={note.toStatus} />
							</div>
						{/if}
						{#if note.body}
							<p class="mt-1 text-sm whitespace-pre-line">{note.body}</p>
						{/if}
						<p class="text-muted-foreground mt-1 text-xs" title={formatDateTime(note.createdAt)}>
							{note.author?.name || note.author?.email || 'Someone'} · {formatRelative(note.createdAt)}
						</p>
					</li>
				{/each}
			</ol>
		{/if}
	</Card.Content>
</Card.Root>

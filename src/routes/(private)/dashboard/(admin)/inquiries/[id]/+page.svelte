<script lang="ts">
	import DeleteButton from '#lib/components/admin/form/delete-button.svelte';
	import InquiryActivity from '#lib/components/admin/inquiries/inquiry-activity.svelte';
	import InquiryForm from '#lib/components/admin/inquiries/inquiry-form.svelte';
	import InquiryStatusBadge from '#lib/components/admin/inquiries/inquiry-status-badge.svelte';
	import PageHeader from '#lib/components/admin/page-header.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { formatDateOnly, formatDateTime } from '#lib/format.js';
	import { channelLabels, kindLabels, sourceLabels, whatsappLink } from '#lib/inquiries.js';
	import { formatDetails } from '#lib/schemas/inquiry-details.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let editing = $state(false);

	const inquiry = $derived(data.inquiry);
	const firstName = $derived(inquiry?.name.split(' ')[0] ?? '');
	const about = $derived(inquiry?.package?.title ?? inquiry?.interest ?? inquiry?.service?.name ?? null);
	const greeting = $derived(
		inquiry
			? `Hi ${firstName}, thank you for contacting Altura Tours & Travel${about ? ` about ${about}` : ''}.`
			: ''
	);
	const whatsapp = $derived(inquiry ? whatsappLink(inquiry.phone, greeting) : null);
	const detailRows = $derived(inquiry ? formatDetails(inquiry.kind, inquiry.details) : []);
	const mailto = $derived(
		inquiry?.email
			? `mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: your inquiry #${inquiry.number}${about ? ` – ${about}` : ''}`)}&body=${encodeURIComponent(`${greeting}\n\n`)}`
			: null
	);
</script>

<a href="/dashboard/inquiries" class="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm">
	<ArrowLeftIcon class="size-4" />
	Inquiries
</a>

{#if !inquiry}
	<PageHeader title="Log inquiry" description="Record a lead that came in by WhatsApp, phone, email or in person." />
	<div class="max-w-3xl">
		<InquiryForm inquiry={null} services={data.services} packages={data.packages} />
	</div>
{:else}
	<PageHeader title="#{inquiry.number} · {inquiry.name}">
		{#snippet actions()}
			<InquiryStatusBadge status={inquiry.status} class="px-3 py-1 text-sm" />
		{/snippet}
	</PageHeader>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
		<div class="min-w-0 space-y-6">
			{#if editing}
				{#key inquiry.updatedAt}
					<InquiryForm
						{inquiry}
						services={data.services}
						packages={data.packages}
						onCancel={() => (editing = false)}
						onSaved={() => (editing = false)}
					/>
				{/key}
			{:else}
				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between gap-4">
						<div>
							<Card.Title>Contact</Card.Title>
							{#if inquiry.preferredContact}
								<Card.Description>Prefers {channelLabels[inquiry.preferredContact]}</Card.Description>
							{/if}
						</div>
						<Button variant="ghost" size="sm" onclick={() => (editing = true)}>
							<PencilIcon data-icon="inline-start" />
							Edit
						</Button>
					</Card.Header>
					<Card.Content class="space-y-4">
						<dl class="grid gap-3 text-sm sm:grid-cols-2">
							<div><dt class="text-muted-foreground">Phone / WhatsApp</dt><dd>{inquiry.phone ?? '—'}</dd></div>
							<div><dt class="text-muted-foreground">Email</dt><dd class="break-all">{inquiry.email ?? '—'}</dd></div>
							<div><dt class="text-muted-foreground">Country</dt><dd>{inquiry.country ?? '—'}</dd></div>
						</dl>
						<div class="flex flex-wrap gap-2">
							{#if whatsapp}
								<Button href={whatsapp} target="_blank" rel="noreferrer" class="bg-[#22C55E] text-white hover:bg-[#16a34a]">
									<MessageCircleIcon data-icon="inline-start" />
									WhatsApp
								</Button>
							{/if}
							{#if mailto}
								<Button href={mailto} variant="outline">
									<MailIcon data-icon="inline-start" />
									Email
								</Button>
							{/if}
							{#if inquiry.phone}
								<Button href="tel:{inquiry.phone.replace(/[^\d+]/g, '')}" variant="outline">
									<PhoneIcon data-icon="inline-start" />
									Call
								</Button>
							{/if}
						</div>
						{#if whatsapp && !inquiry.phone?.trim().startsWith('+')}
							<p class="text-muted-foreground text-xs">
								No country code on this number, so WhatsApp assumes Uganda (+256). Edit the number if that's wrong.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header><Card.Title>Request</Card.Title></Card.Header>
					<Card.Content class="space-y-4">
						<dl class="grid gap-3 text-sm sm:grid-cols-2">
							<div>
								<dt class="text-muted-foreground">Interested in</dt>
								<dd>
									{#if inquiry.package}
										<a href="/dashboard/packages/{inquiry.package.id}" class="underline-offset-4 hover:underline">{inquiry.package.title}</a>
									{:else}
										{inquiry.interest ?? inquiry.service?.name ?? '—'}
									{/if}
								</dd>
							</div>
							{#if inquiry.service}
								<div><dt class="text-muted-foreground">Service</dt><dd>{inquiry.service.name}</dd></div>
							{/if}
							<div><dt class="text-muted-foreground">Travel date</dt><dd>{inquiry.travelDate ? formatDateOnly(inquiry.travelDate) : '—'}</dd></div>
							<div><dt class="text-muted-foreground">Group size</dt><dd>{inquiry.groupSize ?? '—'}</dd></div>
							{#if inquiry.currency}
								<div><dt class="text-muted-foreground">Viewing prices in</dt><dd>{inquiry.currency}</dd></div>
							{/if}
						</dl>
						<div>
							<p class="text-muted-foreground mb-1 text-sm">{inquiry.kind === 'GENERAL' ? 'Message' : 'Notes from the customer'}</p>
							{#if inquiry.message}
								<p class="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-line">{inquiry.message}</p>
							{:else}
								<p class="text-muted-foreground text-sm">None</p>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				{#if inquiry.kind !== 'GENERAL' && (detailRows.length || inquiry.institutions.length)}
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								{#if inquiry.kind === 'FLIGHT'}<PlaneIcon class="size-4" />{:else}<GraduationCapIcon class="size-4" />{/if}
								{kindLabels[inquiry.kind]}
							</Card.Title>
							{#if inquiry.kind === 'FLIGHT'}
								<Card.Description>Quote options, then book once the customer confirms.</Card.Description>
							{/if}
						</Card.Header>
						<Card.Content class="space-y-5">
							{#if inquiry.institutions.length}
								<div>
									<p class="text-muted-foreground mb-2 text-sm">Institutions, in order of preference</p>
									<ol class="space-y-2">
										{#each inquiry.institutions as choice (choice.rank)}
											<li class="flex items-center gap-3 text-sm">
												<span class="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">{choice.rank}</span>
												<span>
													{#if choice.institutionId}
														<a href="/dashboard/institutions/{choice.institutionId}" class="font-medium underline-offset-4 hover:underline">{choice.name}</a>
													{:else}
														<span class="font-medium">{choice.name}</span>
														<span class="text-muted-foreground text-xs">(no longer listed)</span>
													{/if}
													<span class="text-muted-foreground">· {choice.country}</span>
												</span>
											</li>
										{/each}
									</ol>
								</div>
							{/if}
							{#if detailRows.length}
								<dl class="grid gap-3 text-sm sm:grid-cols-2">
									{#each detailRows as row, i (i)}
										<div><dt class="text-muted-foreground">{row.label}</dt><dd>{row.value}</dd></div>
									{/each}
								</dl>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}

				<p class="text-muted-foreground text-xs">
					Received {formatDateTime(inquiry.createdAt)} via {sourceLabels[inquiry.source]}
					{#if inquiry.createdBy}· logged by {inquiry.createdBy.name || inquiry.createdBy.email}{/if}
					{#if inquiry.sourceUrl}· from <span class="break-all">{inquiry.sourceUrl}</span>{/if}
				</p>
			{/if}
		</div>

		<div class="space-y-6">
			<InquiryActivity status={inquiry.status} notes={inquiry.notes} />
		</div>
	</div>

	<div class="mt-10 flex justify-end border-t pt-6">
		<DeleteButton
			label="Delete inquiry"
			title="Delete inquiry #{inquiry.number}?"
			description="It and its notes are removed permanently. For spam or duplicates you can also mark it Closed instead."
		/>
	</div>
{/if}

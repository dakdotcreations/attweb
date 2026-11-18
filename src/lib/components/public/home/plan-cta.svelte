<!--
	Closing call to action on inner pages: the ask and the office. `tone="dark"` (default) is a forest
	band that leads into the footer; `tone="light"` is a cream band for pages whose last section is
	already dark. `children` renders above the ask inside the same band (the About page puts its
	partner logos there).
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import type { Snippet } from 'svelte';
	import Postmark from '../postmark.svelte';
	import { reveal } from '../reveal.js';
	import { TRUST_BADGES } from '../site.js';
	import WhatsAppButton from '../whatsapp-button.svelte';

	let {
		whatsappNumber,
		email,
		address,
		officeHours,
		image = null,
		tone = 'dark',
		children
	}: {
		whatsappNumber: string | null;
		email: string | null;
		address: string | null;
		officeHours: string | null;
		image?: string | null;
		tone?: 'dark' | 'light';
		children?: Snippet;
	} = $props();

	const light = $derived(tone === 'light');
</script>

<section
	class={cn('relative isolate overflow-hidden py-20 sm:py-28', light ? 'bg-cream text-forest-950' : 'bg-forest-900 text-paper')}
	aria-labelledby="cta-title"
>
	{#if image && !light}
		<img src={image} alt="" loading="lazy" class="absolute inset-0 -z-10 size-full object-cover opacity-30" />
		<div class="from-forest-900 via-forest-900/85 to-forest-900/40 absolute inset-0 -z-10 bg-linear-to-r"></div>
	{/if}

	{#if children}
		<div class="border-forest-950/10 mb-20 border-b pb-16 sm:mb-28 sm:pb-20">{@render children()}</div>
	{/if}

	<div class="mx-auto grid max-w-7xl grid-cols-1 items-end gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8" {@attach reveal({ selector: '[data-reveal]', stagger: 0.1 })}>
		<div class="lg:col-span-7">
			<span data-reveal class={cn('block h-0.5 w-10', light ? 'bg-gold-500' : 'bg-gold-400')} aria-hidden="true"></span>
			<h2 id="cta-title" data-reveal class="font-display mt-5 text-5xl leading-[0.95] font-semibold text-balance uppercase sm:text-7xl">
				Tell us where you're going
			</h2>
			<p data-reveal class={cn('mt-6 max-w-xl text-lg leading-relaxed', light ? 'text-ink/75' : 'text-paper/80')}>
				Share your dates and ideas and we'll put together a trip for you. No payment is needed to ask.
			</p>
			<div data-reveal class="mt-8 flex flex-wrap gap-3">
				<a
					href="/contact"
					class={cn(
						'inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none',
						light
							? 'bg-forest-900 text-paper hover:bg-forest-700 focus-visible:ring-forest-700/40'
							: 'bg-paper text-forest-900 hover:bg-gold-300 focus-visible:ring-gold-400/60'
					)}
				>
					Plan my trip <ArrowRightIcon class="size-4" />
				</a>
				<WhatsAppButton number={whatsappNumber} size="lg" label="Chat on WhatsApp" />
			</div>
		</div>

		{#if address || email || officeHours}
			<div
				data-reveal
				class={cn(
					'flex items-start gap-6 border-t pt-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10',
					light ? 'border-forest-950/15' : 'border-paper/15'
				)}
			>
				<!-- Gold is too faint for detail on cream, so the light postmark is inked in forest. -->
				<Postmark place="KAMPALA ROAD" line="UGANDA" class={cn('w-24 shrink-0', light ? 'text-forest-700/70' : 'text-gold-300/80')} waves={false} />
				<dl class={cn('grid gap-3 text-sm', light ? 'text-ink/80' : 'text-paper/80')}>
					{#if address}<div><dt class="sr-only">Office</dt><dd class="whitespace-pre-line">{address}</dd></div>{/if}
					{#if officeHours}<div><dt class="sr-only">Hours</dt><dd>{officeHours}</dd></div>{/if}
					{#if email}
						<div>
							<dt class="sr-only">Email</dt>
							<dd><a href="mailto:{email}" class={cn('break-all', light ? 'hover:text-forest-700 underline-offset-4 hover:underline' : 'hover:text-gold-300')}>{email}</a></dd>
						</div>
					{/if}
					{#each TRUST_BADGES as badge (badge)}
						<div class="flex items-center gap-2">
							<dt class="sr-only">Membership</dt>
							<ShieldCheckIcon class={cn('size-4 shrink-0', light ? 'text-forest-700' : 'text-gold-300')} />
							<dd>{badge}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}
	</div>
</section>

<!-- Section heading: gold dash, condensed-caps title, optional intro and a link on the right. -->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { reveal } from './reveal.js';

	let {
		title,
		intro,
		link,
		align = 'left',
		tone = 'dark',
		id
	}: {
		/** Accepted for older callers; not shown (labels above headings are off the system). */
		eyebrow?: string;
		title: string;
		intro?: string;
		link?: { href: string; label: string };
		align?: 'left' | 'center';
		/** "light" for text on forest backgrounds. */
		tone?: 'dark' | 'light';
		id?: string;
	} = $props();
</script>

<div
	class={cn('flex flex-wrap items-end gap-6', align === 'center' ? 'flex-col items-center text-center' : 'justify-between')}
	{@attach reveal({ selector: '[data-reveal]', stagger: 0.08 })}
>
	<div class={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
		<span data-reveal class={cn('block h-0.5 w-10', align === 'center' && 'mx-auto', tone === 'light' ? 'bg-gold-400' : 'bg-gold-500')} aria-hidden="true"></span>
		<h2
			{id}
			data-reveal
			class={cn(
				'font-display mt-5 text-4xl leading-[0.95] font-semibold text-balance uppercase sm:text-5xl lg:text-6xl',
				tone === 'light' ? 'text-paper' : 'text-forest-950'
			)}
		>
			{title}
		</h2>
		{#if intro}
			<p data-reveal class={cn('mt-5 text-base leading-relaxed sm:text-lg', tone === 'light' ? 'text-paper/75' : 'text-ink/70')}>{intro}</p>
		{/if}
	</div>
	{#if link}
		<a
			data-reveal
			href={link.href}
			class={cn(
				'inline-flex h-12 shrink-0 items-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors',
				tone === 'light' ? 'border-paper/50 hover:bg-paper hover:text-forest-950' : 'border-forest-950/30 text-forest-950 hover:bg-forest-950 hover:text-paper'
			)}
		>
			{link.label}
			<ArrowRightIcon class="size-4" />
		</a>
	{/if}
</div>

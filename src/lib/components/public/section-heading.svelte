<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { reveal } from './reveal.js';

	let {
		eyebrow,
		title,
		intro,
		link,
		align = 'left',
		tone = 'dark',
		id
	}: {
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
		{#if eyebrow}
			<p data-reveal class="text-gold-600 flex items-center gap-3 text-xs font-bold tracking-[0.3em] uppercase {align === 'center' ? 'justify-center' : ''} {tone === 'light' ? 'text-gold-400' : ''}">
				<span class="bg-gold-500 h-px w-8"></span>
				{eyebrow}
				{#if align === 'center'}<span class="bg-gold-500 h-px w-8"></span>{/if}
			</p>
		{/if}
		<h2
			{id}
			data-reveal
			class={cn(
				'font-heading mt-4 text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-[2.75rem]',
				tone === 'light' ? 'text-cream' : 'text-forest-900'
			)}
		>
			{title}
		</h2>
		{#if intro}
			<p data-reveal class={cn('mt-4 text-base sm:text-lg', tone === 'light' ? 'text-cream/75' : 'text-ink/70')}>{intro}</p>
		{/if}
	</div>
	{#if link}
		<a
			data-reveal
			href={link.href}
			class={cn(
				'group inline-flex shrink-0 items-center gap-2 text-sm font-bold',
				tone === 'light' ? 'text-gold-400 hover:text-gold-300' : 'text-forest-800 hover:text-forest-600'
			)}
		>
			{link.label}
			<ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-1" />
		</a>
	{/if}
</div>

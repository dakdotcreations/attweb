<!--
	Altura logo.
	- "lockup" (default): crane mark + Cinzel wordmark side by side. Used in the header and footer;
	  the text colour adapts to the background (tone), so it reads on photos and on cream.
	- "full": the stacked crest from static/brand (only on light backgrounds).
	If an image fails to load, the text wordmark is shown on its own.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { LOGO } from './site.js';

	let {
		variant = 'lockup',
		tone = 'dark',
		class: className
	}: { variant?: 'lockup' | 'full'; tone?: 'dark' | 'light'; class?: string } = $props();

	let failed = $state(false);

	// An image that 404s before hydration never fires onerror in the browser, so check on mount too.
	function checkLoaded(img: HTMLImageElement) {
		if (img.complete && img.naturalWidth === 0) failed = true;
	}
</script>

{#snippet wordmark()}
	<span class="flex flex-col leading-none">
		<span
			class={cn(
				'font-heading text-[1.6em] font-bold tracking-[0.06em]',
				tone === 'light' ? 'text-cream' : 'text-forest-800'
			)}
		>
			ALTURA
		</span>
		<span
			class={cn(
				'mt-1 text-[0.5em] font-bold tracking-[0.28em] whitespace-nowrap',
				tone === 'light' ? 'text-gold-300' : 'text-gold-600'
			)}
		>
			TOURS &amp; TRAVEL
		</span>
	</span>
{/snippet}

{#if variant === 'full' && !failed}
	<img
		src={LOGO.full}
		alt="Altura Tours & Travel Limited"
		class={cn('h-full w-auto object-contain', className)}
		onerror={() => (failed = true)}
		{@attach checkLoaded}
	/>
{:else}
	<span class={cn('flex items-center gap-2', className)} aria-label="Altura Tours & Travel">
		{#if !failed}
			<img
				src={LOGO.mark}
				alt=""
				class="h-[2.9em] w-auto shrink-0 object-contain drop-shadow-sm"
				onerror={() => (failed = true)}
				{@attach checkLoaded}
			/>
		{/if}
		{@render wordmark()}
	</span>
{/if}

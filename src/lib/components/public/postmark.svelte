<!--
	Circular postmark cancel: place around the top of the ring, a date line across the middle,
	and wavy cancel lines trailing to the right. Drawn in currentColor so the caller picks the ink.
	Decorative by default (aria-hidden); pass `label` when the postmark carries information.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';

	let {
		place = 'KAMPALA',
		line = 'UGANDA',
		date = '',
		waves = true,
		label,
		class: className
	}: {
		/** Arched around the top of the ring. */
		place?: string;
		/** Arched around the bottom of the ring. */
		line?: string;
		/** Straight across the centre band, e.g. "MAR 2026". */
		date?: string;
		/** Cancel lines trailing to the right of the ring. */
		waves?: boolean;
		label?: string;
		class?: string;
	} = $props();

	const uid = $props.id();
</script>

<svg
	viewBox={waves ? '0 0 260 120' : '0 0 120 120'}
	class={cn('overflow-visible', className)}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	fill="none"
	stroke="currentColor"
>
	<defs>
		<path id="{uid}-top" d="M 20 60 A 40 40 0 0 1 100 60" />
		<path id="{uid}-bottom" d="M 16 60 A 44 44 0 0 0 104 60" />
	</defs>
	<circle cx="60" cy="60" r="56" stroke-width="2.5" />
	<circle cx="60" cy="60" r="34" stroke-width="1.5" />
	<g stroke="none" fill="currentColor" font-family="var(--font-sans)" font-weight="700" letter-spacing="2.5">
		<text font-size="11.5" text-anchor="middle"><textPath href="#{uid}-top" startOffset="50%">{place}</textPath></text>
		<text font-size="9.5" text-anchor="middle" dominant-baseline="hanging"><textPath href="#{uid}-bottom" startOffset="50%">{line}</textPath></text>
		{#if date}
			<text x="60" y="64" font-size="11" text-anchor="middle" letter-spacing="1">{date}</text>
		{/if}
	</g>
	{#if waves}
		<g stroke-width="2.5" stroke-linecap="round">
			{#each [36, 52, 68, 84] as y (y)}
				<path d="M 122 {y} q 17 -9 34 0 t 34 0 t 34 0 t 34 0" />
			{/each}
		</g>
	{/if}
</svg>

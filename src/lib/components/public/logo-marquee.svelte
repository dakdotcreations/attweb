<!--
	A slow, untitled strip of partner logos (airlines, universities, hospitals) that drifts left in a
	loop. Pure CSS transform animation, visible before JS. Pauses on hover, keyboard focus and with
	the pause button; for reduced motion it is a static, centred, wrapping row.
-->
<script lang="ts">
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';

	type Logo = { key: string; name: string; src: string };

	let { logos, label = 'Airlines, universities and hospitals we work with' }: { logos: Logo[]; label?: string } = $props();

	let paused = $state(false);

	/** A loop of one or two logos repeating looks broken, so short lists sit still. */
	const MIN_TO_SCROLL = 5;
	const scrolls = $derived(logos.length >= MIN_TO_SCROLL);

	// Repeat the set until one copy is wider than a large screen, then render that copy twice:
	// sliding by exactly one copy (-50%) loops without a seam.
	const MIN_PER_COPY = 10;
	const copy = $derived(
		Array.from({ length: Math.ceil(MIN_PER_COPY / Math.max(logos.length, 1)) }, (_, round) =>
			logos.map((logo) => ({ ...logo, round }))
		).flat()
	);
	/** Roughly 4.5s per logo keeps the drift slow whatever the count. */
	const duration = $derived(`${Math.round(copy.length * 4.5)}s`);
</script>

{#snippet image(logo: Logo, announced: boolean)}
	<img
		src={logo.src}
		alt={announced ? logo.name : ''}
		title={logo.name}
		loading="lazy"
		decoding="async"
		class="h-10 w-auto max-w-36 object-contain opacity-60 grayscale transition-opacity duration-300 hover:opacity-100 hover:grayscale-0 sm:h-12 sm:max-w-44"
	/>
{/snippet}

<section class="bg-paper-200 py-12 sm:py-16" aria-label={label}>
	{#if !scrolls}
		<ul class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-16 gap-y-8 px-4 sm:px-6 lg:px-8">
			{#each logos as logo (logo.key)}
				<li class="shrink-0">{@render image(logo, true)}</li>
			{/each}
		</ul>
	{:else}
	<div class="marquee overflow-hidden" data-paused={paused ? '' : undefined} style:--marquee-duration={duration}>
		<div class="marquee-track flex w-max">
			{#each [0, 1] as pass (pass)}
				<ul class="marquee-copy flex shrink-0 items-center gap-12 pr-12 sm:gap-20 sm:pr-20" aria-hidden={pass === 1 ? true : undefined}>
					{#each copy as logo (`${logo.key}-${logo.round}`)}
						<!-- Only the first appearance of each logo is announced; repeats are decoration. -->
						<li class="shrink-0" class:repeat={logo.round > 0}>{@render image(logo, pass === 0 && logo.round === 0)}</li>
					{/each}
				</ul>
			{/each}
		</div>
	</div>
	<div class="mx-auto mt-6 flex max-w-7xl justify-end px-4 motion-reduce:hidden sm:px-6 lg:px-8">
		<button
			type="button"
			onclick={() => (paused = !paused)}
			aria-pressed={paused}
			class="text-forest-900 ring-forest-950/15 hover:bg-paper flex size-9 items-center justify-center rounded-full ring-1 transition-colors"
		>
			{#if paused}<PlayIcon class="size-4" />{:else}<PauseIcon class="size-4" />{/if}
			<span class="sr-only">{paused ? 'Play' : 'Pause'} the logo strip</span>
		</button>
	</div>
	{/if}
</section>

<style>
	.marquee {
		mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
	}
	.marquee-track {
		animation: drift var(--marquee-duration) linear infinite;
	}
	.marquee:hover .marquee-track,
	.marquee:focus-within .marquee-track,
	.marquee[data-paused] .marquee-track {
		animation-play-state: paused;
	}
	@keyframes drift {
		to {
			transform: translateX(-50%);
		}
	}

	/* Reduced motion: one static, centred, wrapping row of each logo once. */
	@media (prefers-reduced-motion: reduce) {
		.marquee {
			mask-image: none;
		}
		.marquee-track {
			animation: none;
			width: auto;
			justify-content: center;
			padding-inline: 1rem;
		}
		.marquee-copy {
			flex-wrap: wrap;
			justify-content: center;
			row-gap: 2rem;
			padding-right: 0;
		}
		.marquee-copy[aria-hidden],
		.repeat {
			display: none;
		}
	}
</style>

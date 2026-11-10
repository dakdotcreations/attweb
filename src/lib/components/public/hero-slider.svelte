<!--
	Homepage hero: featured packages as full-bleed slides (managed via "Feature on homepage"
	in the dashboard). Falls back to a single brand slide when nothing is featured.

	Motion layers:
	- CSS: crossfade between slides, slow Ken Burns zoom, intro of the first slide on page load
	  (runs at first paint, no JS needed, disabled for reduced motion).
	- GSAP: SplitText line reveal + staggered details on each slide change, and a gentle scroll
	  parallax on the imagery. Skipped entirely for reduced motion.
-->
<script lang="ts">
	import { formatDuration, type Currency } from '#lib/format.js';
	import { prefersReducedMotion, useGsap } from '#lib/hooks/UseGsap.svelte.js';
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PriceTag from './price-tag.svelte';
	import { BRAND } from './site.js';
	import WhatsAppButton from './whatsapp-button.svelte';

	type Slide = {
		id: string;
		title: string;
		slug: string;
		summary: string;
		durationDays: number;
		durationNights: number | null;
		location: string | null;
		coverImage: { url: string; alt: string };
		fromPrice: { label: string; amountUGX: number | null; amountUSD: number | null } | null;
	};

	let {
		slides,
		currency,
		whatsappNumber,
		fallbackImage = null
	}: {
		slides: Slide[];
		currency: Currency;
		whatsappNumber: string | null;
		fallbackImage?: string | null;
	} = $props();

	const AUTOPLAY_MS = 7000;

	let root = $state<HTMLElement>();
	let index = $state(0);
	let hovering = $state(false);
	let focusWithin = $state(false);
	let tabHidden = $state(false);
	let autoplayAllowed = $state(false); // enabled on mount unless reduced motion
	let firstPaint = $state(true); // CSS intro only for the initial slide
	let cycle = $state(0); // restarts the progress bar together with the timer

	const count = $derived(slides.length);
	const playing = $derived(autoplayAllowed && count > 1 && !hovering && !focusWithin && !tabHidden);

	function go(to: number) {
		if (count < 2) return;
		firstPaint = false;
		index = (to + count) % count;
	}
	const next = () => go(index + 1);
	const prev = () => go(index - 1);

	$effect(() => {
		autoplayAllowed = !prefersReducedMotion();
		const onVisibility = () => (tabHidden = document.hidden);
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	});

	// Autoplay: restarts the countdown whenever the slide changes or playback resumes.
	$effect(() => {
		if (!playing) return;
		void index;
		cycle += 1;
		const timer = setTimeout(next, AUTOPLAY_MS);
		return () => clearTimeout(timer);
	});

	// Swipe on touch / pen.
	let pointerStart: { x: number; y: number } | null = null;
	function onPointerDown(e: PointerEvent) {
		if (e.pointerType !== 'mouse') pointerStart = { x: e.clientX, y: e.clientY };
	}
	function onPointerUp(e: PointerEvent) {
		if (!pointerStart) return;
		const dx = e.clientX - pointerStart.x;
		const dy = e.clientY - pointerStart.y;
		pointerStart = null;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}

	// GSAP: per-slide text reveal + scroll parallax.
	let animateIn: ((i: number) => void) | null = null;

	useGsap(
		({ gsap, SplitText, reducedMotion }) => {
			if (reducedMotion || !root) return;
			const el = root;
			let dead = false;
			let splits: InstanceType<typeof SplitText>[] = [];

			// Gentle parallax: imagery drifts slower than the page as you scroll past the hero.
			gsap.to(el.querySelector('[data-hero-media]'), {
				yPercent: 18,
				ease: 'none',
				scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
			});
			gsap.to(el.querySelector('[data-hero-copy]'), {
				yPercent: -12,
				opacity: 0.2,
				ease: 'none',
				scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
			});

			// Split titles once fonts are ready so line breaks are measured with Cinzel.
			document.fonts.ready.then(() => {
				if (dead) return;
				splits = [...el.querySelectorAll<HTMLElement>('[data-hero-title]')].map((title) =>
					SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'hero-line' })
				);
				animateIn = (i: number) => {
					const slide = el.querySelectorAll<HTMLElement>('[data-hero-slide]')[i];
					if (!slide) return;
					const lines = splits[i]?.lines ?? [];
					const details = slide.querySelectorAll('[data-hero-reveal]');
					gsap.killTweensOf([lines, details]);
					gsap
						.timeline({ delay: 0.15 })
						.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' })
						.fromTo(
							details,
							{ y: 18, opacity: 0 },
							{ y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
							'-=0.75'
						);
				};
			});

			return () => {
				dead = true;
				animateIn = null;
				splits.forEach((s) => s.revert());
			};
		},
		() => root
	);

	// Run the reveal for each slide change (the first slide uses the CSS intro instead).
	$effect(() => {
		const i = index;
		if (!firstPaint) animateIn?.(i);
	});

	const whatsappMessage = (title: string) => `Hi Altura, I'm interested in "${title}". Could you share more details?`;
</script>

{#snippet backdrop(src: string | null, alt: string, active: boolean, eager: boolean)}
	<div class={cn('absolute inset-0 transition-opacity duration-[900ms] ease-out', active ? 'opacity-100' : 'opacity-0')}>
		{#if src}
			<img
				{src}
				{alt}
				class={cn('hero-img size-full object-cover', active && 'is-active')}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				decoding="async"
			/>
		{:else}
			<div class="from-forest-800 via-forest-900 to-forest-950 size-full bg-linear-to-br"></div>
		{/if}
	</div>
{/snippet}

<!-- Handlers only pause autoplay (hover/focus), enable swipe, and add ←/→ while focus is inside;
     the dots and arrows remain the real interactive controls. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	bind:this={root}
	class="bg-forest-950 relative isolate h-[80svh] min-h-[34rem] overflow-hidden md:h-[88svh] md:min-h-[38rem]"
	aria-roledescription="carousel"
	aria-label="Featured trips"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	onfocusin={() => (focusWithin = true)}
	onfocusout={(e) => (focusWithin = root?.contains(e.relatedTarget as Node) ?? false)}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onkeydown={onKeydown}
>
	<!-- Imagery (parallax target). Slightly oversized so the drift never reveals an edge. -->
	<div data-hero-media class="absolute inset-x-0 -top-[6%] -bottom-[14%]">
		{#if count}
			{#each slides as slide, i (slide.id)}
				{@render backdrop(slide.coverImage.url, slide.coverImage.alt, i === index, i === 0)}
			{/each}
		{:else}
			{@render backdrop(fallbackImage, '', true, true)}
		{/if}
	</div>

	<!-- Readability: deep green from the left and bottom, never over the whole photo. -->
	<div class="from-forest-950/90 via-forest-950/55 pointer-events-none absolute inset-0 bg-linear-to-r to-transparent"></div>
	<div class="from-forest-950/80 pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t to-transparent"></div>
	<div class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/45 to-transparent"></div>

	<div data-hero-copy class="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-24 sm:px-6 md:items-center md:pb-0 lg:px-8">
		{#if count}
			<div class="grid w-full">
				{#each slides as slide, i (slide.id)}
					{@const active = i === index}
					<article
						data-hero-slide
						class={cn(
							'col-start-1 row-start-1 max-w-2xl transition-opacity duration-500',
							active ? 'opacity-100' : 'pointer-events-none opacity-0',
							active && firstPaint && 'hero-intro'
						)}
						aria-roledescription="slide"
						aria-label="{i + 1} of {count}"
						aria-hidden={!active}
						inert={!active}
					>
						<p data-hero-reveal class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase sm:text-sm">
							{BRAND.tagline}
						</p>
						<h2
							data-hero-title
							class="font-heading text-cream mt-4 text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-7xl"
						>
							{slide.title}
						</h2>
						<p data-hero-reveal class="text-cream/90 mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
							<span>{formatDuration(slide.durationDays, slide.durationNights)}</span>
							{#if slide.location}
								<span class="bg-gold-400 size-1 rounded-full"></span>
								<span class="inline-flex items-center gap-1"><MapPinIcon class="size-4" />{slide.location}</span>
							{/if}
						</p>
						{#if slide.summary}
							<p data-hero-reveal class="text-cream/80 mt-3 line-clamp-2 max-w-xl text-base sm:text-lg">{slide.summary}</p>
						{/if}
						<div data-hero-reveal class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-5">
							{#if slide.fromPrice}<PriceTag price={slide.fromPrice} {currency} size="lg" />{/if}
							<div class="flex flex-wrap gap-3">
								<a
									href="/tours/{slide.slug}#inquire"
									class="bg-cream text-forest-900 hover:bg-gold-300 focus-visible:ring-gold-400/60 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors focus-visible:ring-4 focus-visible:outline-none"
								>
									Inquire now <ArrowRightIcon class="size-4" />
								</a>
								<WhatsAppButton number={whatsappNumber} message={whatsappMessage(slide.title)} size="lg" />
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="hero-intro max-w-2xl">
				<p data-hero-reveal class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase sm:text-sm">
					Altura Tours &amp; Travel
				</p>
				<h1 class="font-heading text-cream mt-4 text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-7xl">
					Your journey, our passion
				</h1>
				<p data-hero-reveal class="text-cream/85 mt-5 max-w-xl text-lg">
					Gorilla trekking, wildlife safaris and journeys across Uganda, planned by a team you can trust.
				</p>
				<div data-hero-reveal class="mt-8 flex flex-wrap gap-3">
					<a
						href="/contact"
						class="bg-cream text-forest-900 hover:bg-gold-300 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors"
					>
						Plan my trip <ArrowRightIcon class="size-4" />
					</a>
					<WhatsAppButton number={whatsappNumber} size="lg" />
				</div>
			</div>
		{/if}
	</div>

	{#if count > 1}
		<!-- Controls: progress dots (the active one fills while autoplaying) + arrows. -->
		<div class="absolute inset-x-0 bottom-6 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
			<div class="flex items-center gap-2" role="group" aria-label="Choose slide">
				{#each slides as slide, i (slide.id)}
					<button
						type="button"
						class="group relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-[width] duration-500 {i === index ? 'w-12' : 'w-6 hover:bg-white/50'}"
						aria-label="Show {slide.title}"
						aria-current={i === index}
						onclick={() => go(i)}
					>
						{#if i === index}
							{#key `${index}-${cycle}`}
								<span
									class="bg-gold-400 absolute inset-y-0 left-0 rounded-full {playing ? 'hero-progress' : 'w-full opacity-60'}"
									style="--hero-duration: {AUTOPLAY_MS}ms"
								></span>
							{/key}
						{/if}
					</button>
				{/each}
			</div>
			<div class="hidden gap-2 sm:flex">
				<button
					type="button"
					class="text-cream hover:bg-cream hover:text-forest-900 flex size-11 items-center justify-center rounded-full ring-1 ring-white/40 transition-colors"
					aria-label="Previous slide"
					onclick={prev}
				>
					<ChevronLeftIcon class="size-5" />
				</button>
				<button
					type="button"
					class="text-cream hover:bg-cream hover:text-forest-900 flex size-11 items-center justify-center rounded-full ring-1 ring-white/40 transition-colors"
					aria-label="Next slide"
					onclick={next}
				>
					<ChevronRightIcon class="size-5" />
				</button>
			</div>
		</div>
	{/if}
</section>

<style>
	/* Slow Ken Burns zoom on the visible slide. */
	:global(.hero-img) {
		transform: scale(1.12);
		transition: transform 1.2s ease-out;
	}
	:global(.hero-img.is-active) {
		animation: hero-kenburns 9s ease-out forwards;
	}
	@keyframes hero-kenburns {
		from {
			transform: scale(1.12);
		}
		to {
			transform: scale(1);
		}
	}

	/* First-paint intro (pure CSS, so text is never hidden waiting for JS). */
	.hero-intro :global([data-hero-reveal]),
	.hero-intro :global(h1),
	.hero-intro :global(h2) {
		animation: hero-rise 1s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.hero-intro :global(h1),
	.hero-intro :global(h2) {
		animation-delay: 0.15s;
	}
	.hero-intro :global([data-hero-reveal]:nth-of-type(2)) {
		animation-delay: 0.35s;
	}
	.hero-intro :global([data-hero-reveal]:nth-of-type(3)) {
		animation-delay: 0.45s;
	}
	.hero-intro :global([data-hero-reveal]:last-child) {
		animation-delay: 0.55s;
	}
	@keyframes hero-rise {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	/* Autoplay countdown inside the active dot. */
	.hero-progress {
		width: 0;
		animation: hero-progress var(--hero-duration) linear forwards;
	}
	@keyframes hero-progress {
		to {
			width: 100%;
		}
	}

	/* SplitText line masks: keep descenders from being clipped. */
	:global(.hero-line) {
		padding-bottom: 0.08em;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.hero-img),
		:global(.hero-img.is-active) {
			animation: none;
			transform: none;
			transition: none;
		}
		.hero-intro :global(*) {
			animation: none !important;
		}
	}
</style>

<!--
	Homepage hero: the published services as a full-bleed slider that plays on its own, so a
	visitor who never touches it still sees every service.

	- The current service fills the screen (photo crossfade with a slow zoom); its name, summary
	  and actions sit on the left.
	- The services coming up wait on the right as photo cards. On each step the first card takes
	  over the background and the queue slides along (animate:flip).
	- Controls: previous / next, pause, a progress line that fills over each slide, and the slide
	  number. Autoplay pauses on hover, keyboard focus and hidden tabs; the pause button covers
	  everyone else (WCAG 2.2.2). Reduced motion keeps autoplay but swaps without movement.
-->
<script lang="ts">
	import { prefersReducedMotion } from '#lib/hooks/UseGsap.svelte.js';
	import { cn } from '#lib/utils.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { tick, untrack } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import BrandIcon from '../brand-icon.svelte';
	import { whatsappLink } from '#lib/inquiries.js';

	type Service = {
		id: string;
		name: string;
		slug: string;
		summary: string;
		coverImage: { url?: string; thumbUrl: string; alt: string } | null;
	};

	let {
		services,
		fallbackImage,
		whatsappNumber,
		companyName
	}: {
		services: Service[];
		fallbackImage: string | null;
		whatsappNumber: string | null;
		companyName: string;
	} = $props();

	const SLIDE_MS = 6500;

	/** Total steps taken (signed); the current service and every queue key derive from it. */
	let step = $state(0);
	let root = $state<HTMLElement>();
	let hovering = $state(false);
	let focusWithin = $state(false);
	let tabHidden = $state(false);
	let paused = $state(false);
	let mounted = $state(false);
	let reduced = $state(false);
	let cycle = $state(0);

	const count = $derived(services.length);
	const mod = (n: number) => ((n % count) + count) % count;
	const index = $derived(count ? mod(step) : 0);
	const current = $derived(services[index]);
	const playing = $derived(mounted && count > 1 && !paused && !hovering && !focusWithin && !tabHidden);
	/**
	 * The services still to come, looped (like the reference) so the row always runs off the
	 * edge even with two services. Keys are absolute step numbers, so on each advance the first
	 * card leaves, the rest keep their keys and slide along (animate:flip), and one joins the end.
	 */
	const QUEUE_MIN = 5;
	const queue = $derived(
		count > 1
			? Array.from({ length: Math.max(QUEUE_MIN, count - 1) }, (_, k) => {
					const key = step + k + 1;
					return { key, service: services[mod(key)] };
				})
			: []
	);

	const image = (s: Service) => s.coverImage?.url ?? s.coverImage?.thumbUrl ?? fallbackImage;
	const two = (n: number) => String(n).padStart(2, '0');

	/**
	 * Moves by `delta` services. Going forward, the queued card being chosen grows from its own
	 * rectangle into the full-bleed background (clip-path), as in the reference; going back the
	 * new photo fades in. Reduced motion swaps instantly.
	 */
	async function advance(delta: number) {
		if (count < 2 || !delta) return;
		const card = delta > 0 && !reduced ? root?.querySelector<HTMLElement>(`[data-queue-key="${step + delta}"]`) : null;
		const box = root?.getBoundingClientRect();
		const from = card && box ? card.getBoundingClientRect() : null;
		step += delta;
		await tick();
		if (reduced || !root || !current) return;
		const bg = root.querySelector<HTMLElement>(`[data-bg="${current.id}"]`);
		if (!bg) return;
		if (from && box) {
			const inset = `inset(${from.top - box.top}px ${box.right - from.right}px ${box.bottom - from.bottom}px ${from.left - box.left}px round 6px)`;
			bg.animate([{ clipPath: inset }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 950, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' });
		} else {
			bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-out' });
		}
	}

	$effect(() => {
		mounted = true;
		reduced = prefersReducedMotion();
		const onVisibility = () => (tabHidden = document.hidden);
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	});

	// Autoplay: restarts the countdown (and the progress line) whenever the slide changes or play resumes.
	$effect(() => {
		if (!playing) return;
		void step;
		untrack(() => (cycle += 1));
		const timer = setTimeout(() => advance(1), SLIDE_MS);
		return () => clearTimeout(timer);
	});

	// Swipe on touch / pen.
	let start: { x: number; y: number } | null = null;
	function onPointerUp(e: PointerEvent) {
		if (!start) return;
		const dx = e.clientX - start.x;
		const dy = e.clientY - start.y;
		start = null;
		if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) advance(dx < 0 ? 1 : -1);
	}

	const wa = $derived(current ? whatsappLink(whatsappNumber, `Hello Altura, I'd like help with ${current.name}.`) : null);
	const ms = $derived(reduced ? 0 : 1);
</script>

<section
	bind:this={root}
	class="bg-forest-950 text-paper relative isolate h-[100svh] min-h-[40rem] overflow-hidden"
	aria-roledescription="carousel"
	aria-label="Our services"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	onfocusin={() => (focusWithin = true)}
	onfocusout={(e) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusWithin = false;
	}}
	onpointerdown={(e) => {
		if (e.pointerType !== 'mouse') start = { x: e.clientX, y: e.clientY };
	}}
	onpointerup={onPointerUp}
>
	<h1 class="sr-only">{companyName}: gorilla trekking, safaris and travel services from Kampala, Uganda</h1>

	<!-- Backgrounds: every service photo stacked; the current one fades in and drifts slowly. -->
	<div class="absolute inset-0 -z-10" aria-hidden="true">
		{#each services as s, i (s.id)}
			{@const src = image(s)}
			{#if src}
				<img
					{src}
					alt=""
					data-bg={s.id}
					fetchpriority={i === 0 ? 'high' : undefined}
					loading={i === 0 ? 'eager' : 'lazy'}
					decoding="async"
					class={cn(
						'absolute inset-0 size-full object-cover transition-opacity ease-out',
						// The new photo appears at once on top (its handover animates the clip); the old one stays
						// at full strength underneath until the clip has finished, then goes.
						i === index ? 'z-[1] opacity-100 duration-0' : reduced ? 'opacity-0 duration-0' : 'opacity-0 delay-[950ms] duration-300',
						i === index && !reduced && 'hero-drift'
					)}
				/>
			{/if}
		{/each}
		<div class="absolute inset-0 z-[2] bg-linear-to-r from-black/70 via-black/35 to-black/10"></div>
		<div class="absolute inset-0 z-[2] bg-linear-to-t from-black/60 via-transparent to-black/40"></div>
		<!-- Phones: the copy sits low over the photo, so weight the scrim to the bottom. -->
		<div class="absolute inset-x-0 bottom-0 z-[2] h-4/5 bg-linear-to-t from-black/90 via-black/60 to-transparent lg:hidden"></div>
	</div>

	{#if current}
		<div class="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pt-28 pb-8 sm:px-6 sm:pb-10 lg:grid lg:grid-cols-12 lg:content-end lg:items-end lg:gap-x-10 lg:gap-y-10 lg:px-8 lg:pb-14">
			<!-- Current service -->
			<div class="lg:col-span-5" aria-live={playing ? 'off' : 'polite'}>
				{#key current.id}
					<div in:fade={{ duration: 700 * ms, delay: 150 * ms }}>
						<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
						<p class="font-display mt-5 text-[3.25rem] leading-[0.92] font-semibold text-balance uppercase sm:text-7xl lg:text-[6.25rem]">
							{current.name}
						</p>
						{#if current.summary}
							<p class="text-paper/80 mt-5 line-clamp-3 max-w-md text-base leading-relaxed sm:text-lg">{current.summary}</p>
						{/if}
					</div>
				{/key}
				<div class="mt-8 flex items-center gap-3">
					{#if wa}
						<a
							href={wa}
							target="_blank"
							rel="noopener noreferrer"
							class="bg-whatsapp hover:bg-whatsapp-dark focus-visible:ring-whatsapp/50 flex size-12 shrink-0 items-center justify-center rounded-full text-white transition-colors focus-visible:ring-4 focus-visible:outline-none"
							aria-label="Ask about {current.name} on WhatsApp"
						>
							<BrandIcon name="whatsapp" class="size-5" />
						</a>
					{/if}
					<a
						href="/services/{current.slug}"
						class="border-paper/60 hover:bg-paper hover:text-forest-950 focus-visible:ring-gold-400/60 inline-flex h-12 items-center gap-2 rounded-full border px-6 text-sm font-semibold tracking-wide transition-colors focus-visible:ring-4 focus-visible:outline-none"
					>
						Explore {current.name} <ArrowRightIcon class="size-4" />
					</a>
				</div>
			</div>

			<!-- Coming up: the queue of services, running off the right edge. -->
			{#if count > 1}
				<div class="mt-8 lg:col-span-7 lg:mt-0">
					<!-- No clipping here: the row runs off the screen's right edge, cut by the section. -->
					<ol class="flex gap-3 sm:gap-5" aria-label="Coming up">
						{#each queue as { key, service: s }, k (key)}
							{@const src = s.coverImage?.thumbUrl ?? image(s)}
							<li
								animate:flip={{ duration: 700 * ms }}
								in:fade={{ duration: 500 * ms, delay: 300 * ms }}
								out:fade={{ duration: 250 * ms }}
								class="w-24 shrink-0 sm:w-40 lg:w-52"
							>
								<button
									type="button"
									data-queue-key={key}
									onclick={() => advance(k + 1)}
									class="group perforated-left bg-forest-800 focus-visible:outline-gold-400 relative block aspect-[5/8] w-full overflow-hidden rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[-webkit-mask:none] focus-visible:[mask:none]"
									aria-label="Show {s.name}"
								>
									{#if src}
										<img {src} alt="" loading="lazy" decoding="async" class="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
									{/if}
									<span class="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent"></span>
									<span class="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
										<span class="bg-gold-400 mb-2 block h-px w-5" aria-hidden="true"></span>
										<span class="font-display block text-base leading-none font-semibold uppercase sm:text-xl">{s.name}</span>
									</span>
								</button>
							</li>
						{/each}
					</ol>
				</div>

				<!-- Controls: previous / next, pause, progress, slide number. -->
				<div class="mt-6 flex items-center gap-3 pr-16 sm:gap-4 md:pr-0 lg:col-span-7 lg:col-start-6 lg:mt-0">
					<button type="button" onclick={() => advance(-1)} class="border-paper/40 hover:bg-paper/10 focus-visible:ring-gold-400/60 flex size-11 shrink-0 items-center justify-center rounded-full border focus-visible:ring-4 focus-visible:outline-none sm:size-12" aria-label="Previous service">
						<ChevronLeftIcon class="size-5" />
					</button>
					<button type="button" onclick={() => advance(1)} class="border-paper/40 hover:bg-paper/10 focus-visible:ring-gold-400/60 flex size-11 shrink-0 items-center justify-center rounded-full border focus-visible:ring-4 focus-visible:outline-none sm:size-12" aria-label="Next service">
						<ChevronRightIcon class="size-5" />
					</button>
					<button
						type="button"
						onclick={() => (paused = !paused)}
						class="text-paper/70 hover:text-paper focus-visible:ring-gold-400/60 flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:outline-none"
						aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
					>
						{#if paused}<PlayIcon class="size-4" />{:else}<PauseIcon class="size-4" />{/if}
					</button>
					<div class="bg-paper/25 relative h-px flex-1" aria-hidden="true">
						{#key cycle}
							<span
								class={cn('bg-gold-400 absolute inset-y-0 left-0 block w-full origin-left', playing ? 'hero-progress' : 'scale-x-0')}
								style="--slide-ms: {SLIDE_MS}ms"
							></span>
						{/key}
					</div>
					<p class="font-display text-4xl leading-none font-semibold tabular-nums sm:text-5xl" aria-label="Service {index + 1} of {count}">
						{two(index + 1)}
					</p>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	:global(.hero-progress) {
		animation: hero-progress var(--slide-ms) linear both;
	}
	@keyframes hero-progress {
		from {
			scale: 0 1;
		}
		to {
			scale: 1 1;
		}
	}
	:global(.hero-drift) {
		animation: hero-drift 14s ease-out both;
	}
	@keyframes hero-drift {
		from {
			scale: 1.08;
		}
		to {
			scale: 1;
		}
	}
</style>

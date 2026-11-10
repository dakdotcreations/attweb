<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/public/site-footer.svelte';
	import SiteHeader from '#lib/components/public/site-header.svelte';
	import WhatsappFab from '#lib/components/public/whatsapp-fab.svelte';
	import { useGsap, type GsapModules } from '#lib/hooks/UseGsap.svelte.js';
	import { cn } from '#lib/utils.js';
	import { tick } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let wrapper = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement>();
	let smoother: ReturnType<GsapModules['ScrollSmoother']['create']> | null = null;
	let refresh: (() => void) | null = null;

	// Pages with a full-bleed hero set `overHero: true` in their load; the header starts transparent.
	const overHero = $derived(page.data.overHero === true);

	/** Registers data-speed / data-lag parallax for the current page, replacing the previous page's. */
	function applyEffects() {
		if (!smoother) return;
		smoother.effects().forEach((trigger) => trigger.kill());
		smoother.effects('[data-speed], [data-lag]');
	}

	/** Height of the fixed header, used as the offset when scrolling to #anchors. */
	const HEADER_OFFSET = 88;

	useGsap(({ ScrollSmoother, ScrollTrigger, reducedMotion }) => {
		refresh = () => ScrollTrigger.refresh();
		// Native scrolling for reduced motion; smoothing only on pointer devices (smoothTouch off).
		if (reducedMotion || !wrapper || !content) return;
		smoother = ScrollSmoother.create({
			wrapper,
			content,
			smooth: 1.1,
			effects: false, // applied via applyEffects() so pages reached by client navigation get them too
			smoothTouch: false
		});
		applyEffects();
		return () => {
			smoother = null;
		};
	});

	afterNavigate(async ({ to, type }) => {
		await tick();
		const hash = to?.url.hash;
		const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
		if (smoother) {
			if (type !== 'enter') applyEffects();
			if (target) smoother.scrollTo(target, type !== 'enter', `top ${HEADER_OFFSET}px`);
			// SvelteKit has already set the native scroll (top, or restored on back/forward):
			// snap the smoothed content to it instead of animating there.
			else smoother.scrollTop(type === 'popstate' ? window.scrollY : 0);
		}
		// New page content changes heights: recalculate every ScrollTrigger.
		requestAnimationFrame(() => refresh?.());
	});
</script>

<svelte:head>
	<title>{data.site.seoTitle || `${data.site.companyName} | Safaris & tours in Uganda`}</title>
	{#if data.site.seoDescription}<meta name="description" content={data.site.seoDescription} />{/if}
	{#if data.site.ogImageUrl}<meta property="og:image" content={data.site.ogImageUrl} />{/if}
</svelte:head>

<!-- Fixed elements live outside the smooth wrapper: transforms on it would break `position: fixed`. -->
<SiteHeader services={data.services} currency={data.currency} whatsappNumber={data.site.whatsappNumber} {overHero} />
<WhatsappFab number={data.site.whatsappNumber} />

<div id="smooth-wrapper" bind:this={wrapper} class="bg-cream text-ink">
	<div id="smooth-content" bind:this={content}>
		<main class={cn(!overHero && 'pt-18')}>
			{@render children()}
		</main>
		<SiteFooter site={data.site} services={data.services} />
	</div>
</div>

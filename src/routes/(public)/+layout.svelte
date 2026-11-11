<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import SiteFooter from '#lib/components/public/site-footer.svelte';
	import SiteHeader from '#lib/components/public/site-header.svelte';
	import WhatsappFab from '#lib/components/public/whatsapp-fab.svelte';
	import {
		markSmootherReady,
		resetSmootherReady,
		useGsap,
		type GsapModules
	} from '#lib/hooks/UseGsap.svelte.js';
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
		if (reducedMotion || !wrapper || !content) {
			markSmootherReady();
			return resetSmootherReady;
		}
		smoother = ScrollSmoother.create({
			wrapper,
			content,
			smooth: 1.1,
			effects: false, // applied via applyEffects() so pages reached by client navigation get them too
			smoothTouch: false
		});
		applyEffects();
		markSmootherReady();
		return () => {
			smoother = null;
			resetSmootherReady();
		};
	});

	// Same-page anchor links (e.g. "Inquire now" → #inquire): glide there with the smoother
	// instead of letting the browser jump. Works for links outside the wrapper too (mobile bar).
	function onDocumentClick(event: MouseEvent) {
		if (!smoother || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
		const link = (event.target as Element | null)?.closest('a');
		if (!link?.hash || link.target) return;
		const url = new URL(link.href);
		if (url.origin !== location.origin || url.pathname !== location.pathname) return;
		const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
		if (!target) return;
		event.preventDefault();
		smoother.scrollTo(target, true, `top ${HEADER_OFFSET}px`);
		history.replaceState(history.state, '', url.hash);
	}

	afterNavigate(async ({ from, to, type }) => {
		await tick();
		const hash = to?.url.hash;
		const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
		if (smoother) {
			if (type !== 'enter') applyEffects();
			if (target) smoother.scrollTo(target, type !== 'enter', `top ${HEADER_OFFSET}px`);
			// Back/forward restores the native scroll, and a same-page navigation (the gallery's
			// "Load more", a filter) keeps it; anything else starts at the top. ScrollSmoother keeps
			// the old window scroll on a new page, so it can't be trusted for new pages.
			else {
				const samePage = from?.url.pathname === to?.url.pathname;
				smoother.scrollTop(type === 'popstate' || samePage ? window.scrollY : 0);
			}
		}
		// New page content changes heights: recalculate every ScrollTrigger.
		requestAnimationFrame(() => refresh?.());
	});
</script>

<svelte:document onclick={onDocumentClick} />

<!-- Fixed elements live outside the smooth wrapper: transforms on it would break `position: fixed`. -->
<SiteHeader services={data.services} currency={data.currency} whatsappNumber={data.site.whatsappNumber} {overHero} />
<WhatsappFab number={data.site.whatsappNumber} />

<div id="smooth-wrapper" bind:this={wrapper} class="bg-paper text-ink">
	<div id="smooth-content" bind:this={content}>
		<main class={cn(!overHero && 'pt-18')}>
			{@render children()}
		</main>
		<SiteFooter site={data.site} services={data.services} />
	</div>
</div>

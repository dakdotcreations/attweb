<!--
	Fixed site header (outside the ScrollSmoother wrapper). Over a hero it starts
	transparent with the light logo and turns solid cream once the page scrolls.

	Mobile menu: a full-screen forest panel *behind* the header (so the logo and the close button stay
	put), rendered as a sibling of <header> because the header's backdrop-filter would otherwise trap a
	fixed child inside the header box. Links sit at the bottom, in thumb reach. It is always in the DOM
	and animated with CSS transform/opacity (closed = inert + visibility hidden), static for reduced motion.
-->
<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { Currency } from '#lib/format.js';
	import { useGsap } from '#lib/hooks/UseGsap.svelte.js';
	import { cn } from '#lib/utils.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import CurrencySwitcher from './currency-switcher.svelte';
	import Logo from './logo.svelte';
	import { MAIN_NAV } from './site.js';
	import WhatsAppButton from './whatsapp-button.svelte';

	let {
		services,
		currency,
		whatsappNumber,
		overHero = false
	}: {
		services: { id: string; name: string; slug: string }[];
		currency: Currency;
		whatsappNumber: string | null;
		/** Page starts with a full-bleed hero: header begins transparent. */
		overHero?: boolean;
	} = $props();

	let scrolled = $state(false);
	let servicesOpen = $state(false);
	let mobileOpen = $state(false);

	/** While the menu is open the header sits transparent and light over the forest panel. */
	const solid = $derived(!mobileOpen && (!overHero || scrolled));

	useGsap(({ ScrollTrigger }) => {
		// Driven by ScrollTrigger so it stays in sync with ScrollSmoother.
		ScrollTrigger.create({
			start: 48,
			end: 'max',
			onToggle: (self) => (scrolled = self.isActive)
		});
	});

	afterNavigate(() => {
		servicesOpen = false;
		mobileOpen = false;
	});

	// Lock page scroll while the mobile menu is open.
	$effect(() => {
		if (!mobileOpen) return;
		const root = document.documentElement;
		const previous = root.style.overflow;
		root.style.overflow = 'hidden';
		return () => (root.style.overflow = previous);
	});

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	// Gold text fails contrast on cream, so the solid header marks the active link
	// with forest text and a gold underline; over a photo hero, light gold reads fine.
	const navTone = (href: string) =>
		solid
			? isActive(href)
				? 'text-forest-950 underline decoration-gold-500 decoration-2 underline-offset-8'
				: 'hover:text-forest-600'
			: isActive(href)
				? 'text-gold-300'
				: 'hover:text-gold-300';

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			servicesOpen = false;
			mobileOpen = false;
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header
	class={cn(
		'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-500',
		solid ? 'bg-paper/95 text-forest-900 shadow-[0_1px_0_0_rgb(201_162_58_/_0.35)] backdrop-blur-md' : 'text-paper'
	)}
	style="padding-top: env(safe-area-inset-top, 0px)"
>
	<div class="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex h-12 shrink-0 items-center text-[15px]" aria-label="Altura Tours & Travel, home">
			<Logo tone={solid ? 'dark' : 'light'} />
		</a>

		<nav class="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
			{#each MAIN_NAV as item (item.href)}
				{#if item.children === 'services' && services.length}
					<div
						class="relative"
						role="presentation"
						onmouseenter={() => (servicesOpen = true)}
						onmouseleave={() => (servicesOpen = false)}
					>
						<button
							type="button"
							class={cn(
								'flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
								navTone(item.href)
							)}
							aria-expanded={servicesOpen}
							aria-controls="services-menu"
							onclick={() => (servicesOpen = !servicesOpen)}
						>
							{item.label}
							<ChevronDownIcon class={cn('size-4 transition-transform', servicesOpen && 'rotate-180')} />
						</button>
						{#if servicesOpen}
							<div id="services-menu" class="absolute top-full left-1/2 w-72 -translate-x-1/2 pt-2">
								<ul class="bg-paper text-forest-900 rounded-md p-2 ring-1 ring-forest-950/10">
									{#each services as service (service.id)}
										<li>
											<a
												href="/services/{service.slug}"
												class="hover:bg-forest-100 block rounded-xl px-3 py-2 text-sm font-medium"
											>
												{service.name}
											</a>
										</li>
									{/each}
									<li class="mt-1 border-t border-gold-500/20 pt-1">
										<a href="/services" class="text-forest-700 hover:bg-forest-100 block rounded-xl px-3 py-2 text-sm font-semibold">
											All services →
										</a>
									</li>
								</ul>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href={item.href}
						class={cn(
							'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
							navTone(item.href)
						)}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/if}
			{/each}
		</nav>

		<div class="ml-auto flex items-center gap-3 lg:ml-2">
			<CurrencySwitcher {currency} tone={solid ? 'dark' : 'light'} />
			<WhatsAppButton number={whatsappNumber} size="sm" class="hidden sm:inline-flex" />
			<button
				type="button"
				class="-mr-2 rounded-full p-2 lg:hidden"
				aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileOpen}
				aria-controls="mobile-menu"
				onclick={() => (mobileOpen = !mobileOpen)}
			>
				{#if mobileOpen}<XIcon class="size-6" />{:else}<MenuIcon class="size-6" />{/if}
			</button>
		</div>
	</div>

</header>

<div
	id="mobile-menu"
	class="mobile-menu bg-forest-950 text-paper fixed inset-0 z-45 overflow-y-auto overscroll-contain lg:hidden"
	data-open={mobileOpen ? '' : undefined}
	inert={!mobileOpen}
>
	<!-- mt-auto (not justify-end) pushes the links to the bottom yet keeps them scrollable when tall. -->
	<div
		class="flex min-h-full flex-col px-6"
		style="padding-top: calc(6.5rem + env(safe-area-inset-top, 0px)); padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px))"
	>
		<nav class="mt-auto" aria-label="Mobile">
			<span class="menu-item bg-gold-400 block h-0.5 w-10" style:--i={0} aria-hidden="true"></span>
			<ul class="border-paper/10 mt-6 border-b">
				{#each MAIN_NAV as item, i (item.href)}
					<li class="menu-item border-paper/10 border-t" style:--i={i + 1}>
						{#if item.children === 'services' && services.length}
							<details class="group">
								<summary
									class={cn(
										'font-display flex cursor-pointer list-none items-center justify-between py-4 text-4xl leading-none font-semibold uppercase [&::-webkit-details-marker]:hidden',
										isActive(item.href) && 'text-gold-300'
									)}
								>
									{item.label}
									<ChevronDownIcon class="text-gold-300 size-7 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
								</summary>
								<ul class="grid gap-1 pb-4">
									{#each services as service (service.id)}
										<li>
											<a
												href="/services/{service.slug}"
												class="text-paper/80 hover:text-gold-300 block py-2 text-base font-medium"
												aria-current={isActive(`/services/${service.slug}`) ? 'page' : undefined}
											>
												{service.name}
											</a>
										</li>
									{/each}
									<li>
										<a href="/services" class="text-gold-300 block py-2 text-base font-semibold">All services →</a>
									</li>
								</ul>
							</details>
						{:else}
							<a
								href={item.href}
								class={cn(
									'font-display block py-4 text-4xl leading-none font-semibold uppercase',
									isActive(item.href) && 'text-gold-300'
								)}
								aria-current={isActive(item.href) ? 'page' : undefined}
							>
								{item.label}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
		<div class="menu-item mt-8" style:--i={MAIN_NAV.length + 1}>
			<WhatsAppButton number={whatsappNumber} size="lg" class="w-full" label="Chat with us on WhatsApp" />
		</div>
	</div>
</div>

<style>
	/* Panel slides down from the top; closing slides it back up, then hides it. */
	.mobile-menu {
		visibility: hidden;
		transform: translateY(-100%);
		transition:
			transform 0.55s cubic-bezier(0.7, 0, 0.2, 1),
			visibility 0s linear 0.55s;
	}
	.mobile-menu[data-open] {
		visibility: visible;
		transform: none;
		transition:
			transform 0.6s cubic-bezier(0.7, 0, 0.2, 1),
			visibility 0s;
	}

	/* Items rise in one after another once the panel is mostly down; on close they drop out together, fast. */
	.menu-item {
		opacity: 0;
		transform: translateY(1.5rem);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}
	.mobile-menu[data-open] .menu-item {
		opacity: 1;
		transform: none;
		transition:
			opacity 0.45s ease,
			transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
		transition-delay: calc(0.3s + var(--i) * 0.06s);
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-menu,
		.mobile-menu[data-open],
		.menu-item,
		.mobile-menu[data-open] .menu-item {
			transition: none;
			transform: none;
		}
	}
</style>

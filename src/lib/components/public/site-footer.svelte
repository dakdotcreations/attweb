<script lang="ts">
	import { whatsappLink } from '#lib/inquiries.js';
	import LinkIcon from '@lucide/svelte/icons/link';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import BrandIcon, { type BrandIconName } from './brand-icon.svelte';
	import Logo from './logo.svelte';
	import { BRAND, MAIN_NAV, TRUST_BADGES } from './site.js';

	type Site = {
		companyName: string;
		tagline: string | null;
		email: string | null;
		phone: string | null;
		whatsappNumber: string | null;
		address: string | null;
		officeHours: string | null;
		socials: Record<string, string | null>;
	};

	let { site, services }: { site: Site; services: { id: string; name: string; slug: string }[] } = $props();

	const socials = $derived(
		Object.entries(site.socials).filter((entry): entry is [string, string] => !!entry[1])
	);
	const brandNames: string[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'tripadvisor'];
	const whatsapp = $derived(whatsappLink(site.whatsappNumber));
	const year = new Date().getFullYear();
</script>

<footer class="bg-forest-950 text-cream/85 relative">
	<div class="gold-rule absolute inset-x-0 top-0"></div>

	<div class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:px-8">
		<div>
			<a href="/" class="inline-flex h-16 items-center text-lg" aria-label="Altura Tours & Travel, home">
				<Logo tone="light" />
			</a>
			<p class="font-heading text-gold-400 mt-4 text-sm tracking-[0.18em] uppercase">{site.tagline || BRAND.tagline}</p>
			<ul class="mt-6 space-y-3 text-sm">
				{#each TRUST_BADGES as badge (badge)}
					<li class="flex items-center gap-2"><ShieldCheckIcon class="text-gold-400 size-4 shrink-0" />{badge}</li>
				{/each}
			</ul>
		</div>

		<nav aria-label="Footer">
			<h2 class="font-heading text-cream mb-4 text-sm font-semibold tracking-[0.2em] uppercase">Explore</h2>
			<ul class="space-y-2 text-sm">
				{#each MAIN_NAV as item (item.href)}
					<li><a href={item.href} class="hover:text-gold-400 transition-colors">{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div>
			<h2 class="font-heading text-cream mb-4 text-sm font-semibold tracking-[0.2em] uppercase">Services</h2>
			<ul class="space-y-2 text-sm">
				{#each services as service (service.id)}
					<li><a href="/services/{service.slug}" class="hover:text-gold-400 transition-colors">{service.name}</a></li>
				{:else}
					<li><a href="/services" class="hover:text-gold-400">All services</a></li>
				{/each}
			</ul>
		</div>

		<div>
			<h2 class="font-heading text-cream mb-4 text-sm font-semibold tracking-[0.2em] uppercase">Visit or call us</h2>
			<ul class="space-y-3 text-sm">
				{#if site.address}
					<li class="flex gap-2"><MapPinIcon class="text-gold-400 mt-0.5 size-4 shrink-0" /><span class="whitespace-pre-line">{site.address}</span></li>
				{/if}
				{#if site.phone}
					<li class="flex gap-2">
						<PhoneIcon class="text-gold-400 mt-0.5 size-4 shrink-0" />
						<a href="tel:{site.phone.replace(/[^\d+]/g, '')}" class="hover:text-gold-400">{site.phone}</a>
					</li>
				{/if}
				{#if whatsapp}
					<li class="flex gap-2">
						<BrandIcon name="whatsapp" class="text-gold-400 mt-0.5 size-4 shrink-0" />
						<a href={whatsapp} target="_blank" rel="noopener noreferrer" class="hover:text-gold-400">{site.whatsappNumber}</a>
					</li>
				{/if}
				{#if site.email}
					<li class="flex gap-2">
						<MailIcon class="text-gold-400 mt-0.5 size-4 shrink-0" />
						<a href="mailto:{site.email}" class="hover:text-gold-400 break-all">{site.email}</a>
					</li>
				{/if}
				{#if site.officeHours}<li class="text-cream/60 pl-6">{site.officeHours}</li>{/if}
			</ul>
			{#if socials.length}
				<ul class="mt-6 flex flex-wrap gap-2">
					{#each socials as [name, url] (name)}
						<li>
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								class="ring-cream/20 hover:bg-gold-500 hover:text-forest-950 flex size-9 items-center justify-center rounded-full ring-1 transition-colors"
								aria-label={name[0].toUpperCase() + name.slice(1)}
							>
								{#if brandNames.includes(name)}
									<BrandIcon name={name as BrandIconName} class="size-4" />
								{:else}
									<LinkIcon class="size-4" />
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="border-cream/10 border-t">
		<div class="text-cream/55 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs sm:px-6 lg:px-8">
			<p>© {year} {BRAND.legalName}. All rights reserved.</p>
			<p>Kampala, Uganda</p>
		</div>
	</div>
</footer>

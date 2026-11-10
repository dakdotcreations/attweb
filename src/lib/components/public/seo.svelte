<!--
	All per-page head tags for the public site: title, description, canonical, Open Graph, Twitter.
	Every public page renders exactly one <Seo>; the public layout emits no page-level tags, so
	nothing is duplicated. Missing values fall back to Settings (SEO title/description/sharing image).
-->
<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { BRAND, LOGO } from './site.js';

	type Site = {
		companyName: string;
		seoTitle: string | null;
		seoDescription: string | null;
		ogImageUrl: string | null;
	};

	let {
		site,
		title,
		description,
		image,
		imageAlt,
		ogTitle,
		type = 'website',
		path,
		noindex = false,
		children
	}: {
		site: Site;
		/** Full document title. Defaults to the site SEO title. */
		title?: string | null;
		description?: string | null;
		/** Sharing image URL; falls back to the Settings sharing image, then the logo. */
		image?: string | null;
		imageAlt?: string | null;
		/** Shorter title for social cards (defaults to `title`). */
		ogTitle?: string | null;
		type?: 'website' | 'article';
		/** Canonical path incl. any query that changes content. Defaults to the path without query. */
		path?: string;
		noindex?: boolean;
		/** Extra head tags (JSON-LD, article:* meta). */
		children?: Snippet;
	} = $props();

	const DEFAULT_DESCRIPTION =
		'Gorilla trekking, wildlife safaris, holidays, flights, visas, medical tourism and study abroad, arranged by a trusted Kampala tour operator.';

	const fullTitle = $derived(title || site.seoTitle || `${site.companyName} | Safaris & tours in Uganda`);
	const desc = $derived((description || site.seoDescription || DEFAULT_DESCRIPTION).trim());
	const canonical = $derived(page.url.origin + (path ?? page.url.pathname));
	const absolute = (url: string) => (url.startsWith('http') ? url : page.url.origin + url);
	const shareImage = $derived(absolute(image || site.ogImageUrl || LOGO.full));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={desc} />
	<link rel="canonical" href={canonical} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}

	<meta property="og:site_name" content={site.companyName || BRAND.name} />
	<meta property="og:type" content={type} />
	<meta property="og:locale" content="en_GB" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={ogTitle || fullTitle} />
	<meta property="og:description" content={desc} />
	<meta property="og:image" content={shareImage} />
	{#if imageAlt}<meta property="og:image:alt" content={imageAlt} />{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle || fullTitle} />
	<meta name="twitter:description" content={desc} />
	<meta name="twitter:image" content={shareImage} />

	{@render children?.()}
</svelte:head>

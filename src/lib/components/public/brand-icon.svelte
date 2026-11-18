<!-- Official brand glyphs from simple-icons (tree-shaken named imports). -->
<script lang="ts" module>
	import { siFacebook, siInstagram, siTiktok, siTripadvisor, siWhatsapp, siYoutube } from 'simple-icons';

	export const brandIcons = {
		whatsapp: siWhatsapp,
		facebook: siFacebook,
		instagram: siInstagram,
		tiktok: siTiktok,
		youtube: siYoutube,
		tripadvisor: siTripadvisor
	} as const;

	export type BrandIconName = keyof typeof brandIcons;
</script>

<script lang="ts">
	let { name, class: className = 'size-5', title }: { name: BrandIconName; class?: string; title?: string } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	class={className}
	fill="currentColor"
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title}
>
	<path d={brandIcons[name].path} />
</svg>

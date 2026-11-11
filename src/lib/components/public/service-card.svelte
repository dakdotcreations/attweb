<!-- A service as a photo card (no stub: services have no single price). -->
<script lang="ts">
	import StampCard from './stamp-card.svelte';

	let {
		service
	}: {
		service: { name: string; slug: string; summary: string; coverImage: { url?: string; thumbUrl: string; alt: string } | null };
	} = $props();
</script>

<StampCard href="/services/{service.slug}" title={service.name} image={service.coverImage} meta={null} aspect="square" />

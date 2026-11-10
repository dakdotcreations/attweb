<!-- Floating WhatsApp button (mobile). Lives outside the smooth-scroll wrapper so `fixed` works. -->
<script lang="ts">
	import { page } from '$app/state';
	import { whatsappLink } from '#lib/inquiries.js';
	import BrandIcon from './brand-icon.svelte';
	import { DEFAULT_WHATSAPP_MESSAGE } from './site.js';

	let { number }: { number: string | null | undefined } = $props();
	const href = $derived(whatsappLink(number, DEFAULT_WHATSAPP_MESSAGE));
</script>

{#if href}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		aria-label="Chat with us on WhatsApp"
		class="bg-whatsapp focus-visible:ring-whatsapp/50 fixed right-4 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-xl shadow-black/25 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:outline-none md:hidden"
		style="bottom: calc({page.data.bookingBar ? '5.5rem' : '1rem'} + env(safe-area-inset-bottom, 0px))"
	>
		<BrandIcon name="whatsapp" class="size-7" />
	</a>
{/if}

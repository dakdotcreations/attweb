<script lang="ts">
	import { whatsappLink } from '#lib/inquiries.js';
	import { cn } from '#lib/utils.js';
	import BrandIcon from './brand-icon.svelte';
	import { DEFAULT_WHATSAPP_MESSAGE } from './site.js';

	let {
		number,
		message = DEFAULT_WHATSAPP_MESSAGE,
		label = 'WhatsApp us',
		size = 'md',
		class: className
	}: {
		number: string | null | undefined;
		message?: string;
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const href = $derived(whatsappLink(number, message));
</script>

{#if href}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		class={cn(
			'bg-whatsapp hover:bg-whatsapp-dark focus-visible:ring-whatsapp/50 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-colors focus-visible:ring-4 focus-visible:outline-none',
			size === 'sm' && 'px-3.5 py-1.5 text-sm',
			size === 'md' && 'px-5 py-2.5 text-sm',
			size === 'lg' && 'px-6 py-3.5 text-base',
			className
		)}
	>
		<BrandIcon name="whatsapp" class={size === 'lg' ? 'size-5' : 'size-4'} />
		{label}
	</a>
{/if}

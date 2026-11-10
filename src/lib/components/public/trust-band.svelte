<script lang="ts">
	import { useGsap } from '#lib/hooks/UseGsap.svelte.js';
	import AwardIcon from '@lucide/svelte/icons/award';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { TRUST_BADGES } from './site.js';

	let { address }: { address: string | null } = $props();

	let root = $state<HTMLElement>();
	const badges = [
		{ text: TRUST_BADGES[0], Icon: AwardIcon },
		{ text: TRUST_BADGES[1], Icon: ShieldCheckIcon }
	];

	useGsap(
		({ gsap, reducedMotion }) => {
			if (reducedMotion) return;
			gsap.from('[data-trust-item]', {
				y: 24,
				opacity: 0,
				duration: 0.9,
				stagger: 0.12,
				ease: 'power3.out',
				scrollTrigger: { trigger: root, start: 'top 85%', once: true }
			});
		},
		() => root
	);
</script>

<section bind:this={root} class="bg-cream border-b border-gold-500/20" aria-label="Why travel with Altura">
	<div class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between lg:px-8">
		<ul class="flex flex-col gap-4 sm:flex-row">
			{#each badges as { text, Icon } (text)}
				<li
					data-trust-item
					class="gold-border text-forest-900 flex items-center gap-3 rounded-full py-2.5 pr-5 pl-2.5 text-sm font-semibold"
					style="--gold-border-fill: var(--color-cream)"
				>
					<span class="bg-forest-800 text-gold-400 flex size-9 shrink-0 items-center justify-center rounded-full">
						<Icon class="size-[18px]" />
					</span>
					{text}
				</li>
			{/each}
		</ul>
		{#if address}
			<p data-trust-item class="text-forest-800/80 flex items-start gap-2 text-sm md:max-w-xs md:text-right">
				<MapPinIcon class="text-gold-600 mt-0.5 size-4 shrink-0 md:order-last" />
				<span>Visit our office: {address.split('\n').join(', ')}</span>
			</p>
		{/if}
	</div>
</section>

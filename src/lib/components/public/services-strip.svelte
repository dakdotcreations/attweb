<!-- Row of service shortcuts directly under the hero (order = dashboard display order). -->
<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { serviceIcon } from './service-icons.js';

	let { services }: { services: { id: string; name: string; slug: string }[] } = $props();
</script>

{#if services.length}
	<nav aria-label="Our services" class="bg-forest-950 text-cream relative">
		<div class="gold-rule absolute inset-x-0 top-0"></div>
		<ul class="mx-auto flex max-w-7xl snap-x snap-mandatory overflow-x-auto px-2 [scrollbar-width:none] sm:px-4 lg:justify-center lg:px-8">
			{#each services as service, i (service.id)}
				{@const Icon = serviceIcon(service.slug, service.name)}
				<li class="shrink-0 snap-start">
					<a
						href="/services/{service.slug}"
						class="group hover:bg-forest-900 flex items-center gap-3 px-5 py-5 transition-colors {i > 0 ? 'border-l border-white/10' : ''}"
					>
						<span class="ring-gold-500/50 group-hover:bg-gold-500 group-hover:text-forest-950 text-gold-400 flex size-10 items-center justify-center rounded-full ring-1 transition-colors">
							<Icon class="size-5" />
						</span>
						<span class="text-sm font-semibold whitespace-nowrap">{service.name}</span>
						<ArrowUpRightIcon class="text-gold-400 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

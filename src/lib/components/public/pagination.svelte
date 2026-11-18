<!-- Numbered page links for public listings (plain links, so it works without JS). -->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let {
		page,
		pageCount,
		href,
		prevLabel = 'Newer',
		nextLabel = 'Older'
	}: {
		page: number;
		pageCount: number;
		/** Builds the URL for page n. */
		href: (n: number) => string;
		prevLabel?: string;
		nextLabel?: string;
	} = $props();
</script>

{#if pageCount > 1}
	<nav aria-label="Pagination" class="mt-16 flex items-center justify-center gap-2">
		{#if page > 1}
			<a href={href(page - 1)} class="text-forest-800 hover:bg-forest-100 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
				<ArrowLeftIcon class="size-4" /> {prevLabel}
			</a>
		{/if}
		<ol class="flex items-center gap-1">
			{#each Array.from({ length: pageCount }, (_, i) => i + 1) as n (n)}
				<li>
					<a
						href={href(n)}
						aria-current={n === page ? 'page' : undefined}
						class={cn(
							'flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors',
							n === page ? 'bg-forest-800 text-paper' : 'text-forest-800 hover:bg-forest-100'
						)}
					>
						{n}
					</a>
				</li>
			{/each}
		</ol>
		{#if page < pageCount}
			<a href={href(page + 1)} class="text-forest-800 hover:bg-forest-100 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
				{nextLabel} <ArrowRightIcon class="size-4" />
			</a>
		{/if}
	</nav>
{/if}

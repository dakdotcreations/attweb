<!-- USD / UGX toggle. A plain POST form (works without JS); enhanced to refresh in place. -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { refreshAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { Currency } from '#lib/format.js';
	import { cn } from '#lib/utils.js';

	let { currency, tone = 'dark' }: { currency: Currency; tone?: 'dark' | 'light' } = $props();
</script>

<form
	method="POST"
	action="/currency"
	class={cn(
		'flex items-center rounded-full p-0.5 text-xs font-semibold',
		tone === 'light' ? 'bg-white/15 ring-1 ring-white/25' : 'bg-forest-100 ring-1 ring-forest-800/10'
	)}
	use:enhance={() =>
		async ({ result }) => {
			// The endpoint redirects back; just reload data in place instead of navigating.
			if (result.type === 'redirect' || result.type === 'success') await refreshAll();
		}}
>
	<input type="hidden" name="redirectTo" value={page.url.pathname + page.url.search} />
	<span class="sr-only">Show prices in</span>
	{#each ['USD', 'UGX'] as const as option (option)}
		{@const active = currency === option}
		<button
			type="submit"
			name="currency"
			value={option}
			aria-pressed={active}
			class={cn(
				'rounded-full px-2.5 py-1 transition-colors',
				active
					? tone === 'light'
						? 'bg-cream text-forest-900'
						: 'bg-forest-800 text-cream'
					: tone === 'light'
						? 'text-cream/80 hover:text-cream'
						: 'text-forest-800/70 hover:text-forest-900'
			)}
		>
			{option}
		</button>
	{/each}
</form>

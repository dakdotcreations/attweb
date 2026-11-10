<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';

	let {
		testimonial: t
	}: {
		testimonial: { name: string; location: string | null; quote: string; rating: number | null; photo: { thumbUrl: string } | null };
	} = $props();
</script>

<blockquote class="flex h-full flex-col gap-4 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
	{#if t.rating}
		<span class="text-gold-500 flex gap-0.5" role="img" aria-label="{t.rating} out of 5 stars">
			{#each { length: 5 } as _, i (i)}<StarIcon class="size-4 {i < t.rating ? 'fill-current' : 'opacity-30'}" />{/each}
		</span>
	{/if}
	<p class="text-ink/85 leading-relaxed">“{t.quote}”</p>
	<footer class="mt-auto flex items-center gap-3">
		{#if t.photo}
			<img src={t.photo.thumbUrl} alt="" class="ring-gold-500/60 size-10 rounded-full object-cover ring-2" loading="lazy" />
		{/if}
		<span class="text-forest-900 text-sm font-extrabold">
			{t.name}{#if t.location}<span class="text-ink/55 font-medium"> · {t.location}</span>{/if}
		</span>
	</footer>
</blockquote>

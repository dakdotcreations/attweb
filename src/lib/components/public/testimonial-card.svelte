<!-- A traveller quote on a light ground: no box, a rule above, name in condensed caps. -->
<script lang="ts">
	let {
		testimonial: t
	}: {
		testimonial: { name: string; location: string | null; quote: string; rating: number | null; photo: { thumbUrl: string } | null };
	} = $props();
</script>

<blockquote class="border-forest-950/15 flex h-full flex-col gap-6 border-t pt-6">
	<p class="text-ink/85 text-lg leading-relaxed">“{t.quote}”</p>
	<footer class="mt-auto flex items-center gap-3">
		{#if t.photo}
			<img src={t.photo.thumbUrl} alt="" class="size-10 rounded-full object-cover" loading="lazy" />
		{/if}
		<span class="text-sm">
			<span class="font-display text-forest-950 text-lg font-semibold tracking-wide uppercase">{t.name}</span>
			{#if t.location}<span class="text-ink/60">, {t.location}</span>{/if}
		</span>
	</footer>
</blockquote>

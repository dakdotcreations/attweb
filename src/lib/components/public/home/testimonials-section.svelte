<script lang="ts">
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import StarIcon from '@lucide/svelte/icons/star';
	import { reveal } from '../reveal.js';
	import SectionHeading from '../section-heading.svelte';

	type Testimonial = {
		id: string;
		name: string;
		location: string | null;
		quote: string;
		rating: number | null;
		photo: { thumbUrl: string; alt: string } | null;
		package: { title: string; slug: string; status: string } | null;
		service: { name: string; slug: string; status: string } | null;
	};

	let { testimonials }: { testimonials: Testimonial[] } = $props();

	const [lead, ...rest] = $derived(testimonials);

	/** Only link to pages that are actually published. */
	function about(t: Testimonial) {
		if (t.package?.status === 'PUBLISHED') return { label: t.package.title, href: `/tours/${t.package.slug}` };
		if (t.service?.status === 'PUBLISHED') return { label: t.service.name, href: `/services/${t.service.slug}` };
		return null;
	}
</script>

{#snippet stars(rating: number | null)}
	{#if rating}
		<span class="text-gold-500 flex gap-0.5" role="img" aria-label="{rating} out of 5 stars">
			{#each { length: 5 } as _, i (i)}
				<StarIcon class="size-4 {i < rating ? 'fill-current' : 'opacity-30'}" />
			{/each}
		</span>
	{/if}
{/snippet}

{#snippet person(t: Testimonial, light = false)}
	<footer class="flex items-center gap-3">
		{#if t.photo}
			<img src={t.photo.thumbUrl} alt="" class="ring-gold-500/60 size-12 rounded-full object-cover ring-2" loading="lazy" />
		{:else}
			<span class="bg-forest-800 text-gold-300 flex size-12 items-center justify-center rounded-full font-bold">
				{t.name.slice(0, 1).toUpperCase()}
			</span>
		{/if}
		<span>
			<cite class="block font-extrabold not-italic {light ? 'text-cream' : 'text-forest-950'}">{t.name}</cite>
			{#if t.location}<span class="text-xs {light ? 'text-cream/60' : 'text-ink/60'}">{t.location}</span>{/if}
		</span>
	</footer>
{/snippet}

{#if lead}
	<section class="bg-cream py-20 sm:py-28" aria-labelledby="testimonials-title">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<SectionHeading
				id="testimonials-title"
				eyebrow="Traveller stories"
				title="In their own words"
				align="center"
			/>

			<div class="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]" {@attach reveal({ selector: '[data-reveal-card]', stagger: 0.12 })}>
				<blockquote data-reveal-card class="bg-forest-900 relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-8 sm:p-12">
					<QuoteIcon class="text-gold-500/25 absolute -top-2 right-6 size-32" />
					<div class="relative">
						{@render stars(lead.rating)}
						<p class="font-heading text-cream mt-6 text-xl leading-relaxed sm:text-2xl">“{lead.quote}”</p>
					</div>
					<div class="relative mt-10 flex flex-wrap items-end justify-between gap-4">
						{@render person(lead, true)}
						{#if about(lead)}
							{@const a = about(lead)!}
							<a href={a.href} class="text-gold-400 hover:text-gold-300 text-xs font-bold">{a.label} →</a>
						{/if}
					</div>
				</blockquote>

				{#if rest.length}
					<div class="grid gap-6">
						{#each rest.slice(0, 3) as t (t.id)}
							<blockquote data-reveal-card class="flex flex-col gap-5 rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/5">
								{@render stars(t.rating)}
								<p class="text-ink/80 line-clamp-5 text-[0.95rem] leading-relaxed">“{t.quote}”</p>
								{@render person(t)}
							</blockquote>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

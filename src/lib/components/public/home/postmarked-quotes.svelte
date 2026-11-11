<!--
	Homepage: traveller quotes as letters home: paper on the forest album page, each cancelled with
	a postmark carrying its provenance (where from, and the month it reached us). Real testimonials
	only (from the dashboard); the section hides when there are none.
-->
<script lang="ts">
	import { cn } from '#lib/utils.js';
	import Postmark from '../postmark.svelte';
	import { reveal } from '../reveal.js';

	type Testimonial = {
		id: string;
		name: string;
		location: string | null;
		quote: string;
		createdAt: Date | string;
		package: { title: string; slug: string; status: string } | null;
		service: { name: string; slug: string; status: string } | null;
	};

	let { testimonials }: { testimonials: Testimonial[] } = $props();

	const shown = $derived(testimonials.slice(0, 2));
	const month = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

	/** Only link to pages that are actually published. */
	function about(t: Testimonial) {
		if (t.package?.status === 'PUBLISHED') return { label: t.package.title, href: `/tours/${t.package.slug}` };
		if (t.service?.status === 'PUBLISHED') return { label: t.service.name, href: `/services/${t.service.slug}` };
		return null;
	}
</script>

{#if shown.length}
	<section class="bg-forest-950 text-paper py-20 sm:py-28" aria-labelledby="quotes-title">
		<div class="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
			<div class="lg:col-span-4 lg:pt-4" {@attach reveal()}>
				<span class="bg-gold-400 block h-0.5 w-10" aria-hidden="true"></span>
				<h2 id="quotes-title" class="font-display mt-5 text-5xl leading-[0.95] font-semibold uppercase sm:text-6xl">Letters home</h2>
			</div>
			<ul class={cn('grid gap-6 lg:col-span-8', shown.length > 1 && 'md:grid-cols-2')} {@attach reveal({ selector: ':scope > li', stagger: 0.1 })}>
				{#each shown as t (t.id)}
					{@const link = about(t)}
					<li class="border-paper/15 relative border-t pt-24 sm:pt-28">
						<Postmark
							place={(t.location?.split(/[\s,]+/)[0] || 'KAMPALA').toUpperCase()}
							line="ALTURA"
							date={month.format(new Date(t.createdAt)).toUpperCase()}
							class="text-gold-300/60 absolute top-5 right-0 w-36 rotate-6 sm:w-40"
						/>
						<blockquote>
							<p class={cn('line-clamp-[10] leading-relaxed', shown.length === 1 ? 'text-xl sm:text-2xl' : 'text-lg')}>“{t.quote}”</p>
							<footer class="mt-8 text-sm">
								<span class="font-display text-paper text-lg font-semibold tracking-wide uppercase">{t.name}</span>
								{#if t.location}<span class="text-paper/65">, {t.location}</span>{/if}
								{#if link}
									<a href={link.href} class="text-gold-300 hover:text-gold-100 mt-1 block font-semibold underline-offset-4 hover:underline">
										{link.label}
									</a>
								{/if}
							</footer>
						</blockquote>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<script lang="ts">
	import TestimonialForm from '#lib/components/admin/testimonials/testimonial-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.testimonial?.id ?? 'new'}
	<TestimonialForm testimonial={data.testimonial} services={data.services} packages={data.packages} />
{/key}

<script lang="ts">
	import BlogPostForm from '#lib/components/admin/blog/blog-post-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.post?.id ?? 'new'}
	<BlogPostForm post={data.post} services={data.services} />
{/key}

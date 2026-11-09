<script lang="ts">
	import { page } from '$app/state';
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { findNavItem } from './nav.js';

	const current = $derived(findNavItem(page.url.pathname));
	const isRoot = $derived(page.url.pathname === '/dashboard');
</script>

<header
	class="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4"
>
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
	<Breadcrumb.Root>
		<Breadcrumb.List>
			{#if isRoot}
				<Breadcrumb.Item>
					<Breadcrumb.Page>Dashboard</Breadcrumb.Page>
				</Breadcrumb.Item>
			{:else}
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="/dashboard">Dashboard</Breadcrumb.Link>
				</Breadcrumb.Item>
				{#if current}
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>{current.title}</Breadcrumb.Page>
					</Breadcrumb.Item>
				{/if}
			{/if}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</header>

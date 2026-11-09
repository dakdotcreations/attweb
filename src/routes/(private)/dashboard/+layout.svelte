<script lang="ts">
	import AppSidebar from '#lib/components/admin/app-sidebar.svelte';
	import SiteHeader from '#lib/components/admin/site-header.svelte';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider open={data.sidebarOpen}>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>
		<SiteHeader />
		<main class="flex-1 p-4 md:p-6">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

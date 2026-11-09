<!-- Minimal placeholder shell. The real sidebar/navigation is built in Phase 2. -->
<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="min-h-svh">
	<header class="flex items-center justify-between border-b px-6 py-3">
		<a href="/dashboard" class="font-heading font-semibold">Altura Admin</a>
		<div class="flex items-center gap-3 text-sm">
			<span class="text-muted-foreground">{data.user.email} · {data.user.role}</span>
			<form method="POST" action="/dashboard/logout">
				<Button type="submit" variant="outline" size="sm">Sign out</Button>
			</form>
		</div>
	</header>
	<main class="p-6">
		{@render children()}
	</main>
</div>

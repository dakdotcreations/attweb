<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import MountainIcon from '@lucide/svelte/icons/mountain';
	import NavUser from './nav-user.svelte';
	import { isNavItemActive, navForRole, type Role } from './nav.js';

	let {
		user,
		badges = {}
	}: {
		user: { name: string; email: string; role: Role };
		/** Counts shown next to nav items, keyed by href (0 hides the badge). */
		badges?: Record<string, number>;
	} = $props();

	const groups = $derived(navForRole(user.role));
	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/dashboard" {...props}>
							<div
								class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<MountainIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">Altura</span>
								<span class="text-muted-foreground truncate text-xs">Tours & Travel</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each groups as group (group.label)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.href)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={isNavItemActive(item.href, page.url.pathname)}
									tooltipContent={item.title}
								>
									{#snippet child({ props })}
										<!-- close the mobile sheet after navigating -->
										<a href={item.href} {...props} onclick={() => sidebar.setOpenMobile(false)}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
								{#if badges[item.href]}
									<Sidebar.MenuBadge aria-label="{badges[item.href]} new">{badges[item.href]}</Sidebar.MenuBadge>
								{/if}
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>

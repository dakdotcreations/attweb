import BlogIcon from '@lucide/svelte/icons/newspaper';
import DashboardIcon from '@lucide/svelte/icons/layout-dashboard';
import InboxIcon from '@lucide/svelte/icons/inbox';
import MediaIcon from '@lucide/svelte/icons/images';
import PackagesIcon from '@lucide/svelte/icons/map';
import ServicesIcon from '@lucide/svelte/icons/briefcase-business';
import SettingsIcon from '@lucide/svelte/icons/settings';
import TestimonialsIcon from '@lucide/svelte/icons/message-square-quote';
import UsersIcon from '@lucide/svelte/icons/users';

export type Role = 'ADMIN' | 'EDITOR';

export type NavItem = {
	title: string;
	href: string;
	icon: typeof DashboardIcon;
	/** Roles that can see this item. Omit for everyone signed in. */
	roles?: Role[];
};

export type NavGroup = { label: string; items: NavItem[] };

// Keep `roles` in sync with the route guards: ADMIN-only pages live under
// routes/(private)/dashboard/(admin)/. Hiding a link is not access control.
export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Overview',
		items: [
			{ title: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
			{ title: 'Inquiries', href: '/dashboard/inquiries', icon: InboxIcon, roles: ['ADMIN'] }
		]
	},
	{
		label: 'Content',
		items: [
			{ title: 'Services', href: '/dashboard/services', icon: ServicesIcon },
			{ title: 'Tour Packages', href: '/dashboard/packages', icon: PackagesIcon },
			{ title: 'Blog', href: '/dashboard/blog', icon: BlogIcon },
			{ title: 'Testimonials', href: '/dashboard/testimonials', icon: TestimonialsIcon },
			{ title: 'Media', href: '/dashboard/media', icon: MediaIcon }
		]
	},
	{
		label: 'Administration',
		items: [
			{ title: 'Users', href: '/dashboard/users', icon: UsersIcon, roles: ['ADMIN'] },
			{ title: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, roles: ['ADMIN'] }
		]
	}
];

/** Nav groups visible to `role`, with empty groups dropped. */
export function navForRole(role: Role): NavGroup[] {
	return NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => !item.roles || item.roles.includes(role))
	})).filter((group) => group.items.length > 0);
}

export function isNavItemActive(href: string, pathname: string) {
	if (href === '/dashboard') return pathname === '/dashboard';
	return pathname === href || pathname.startsWith(`${href}/`);
}

/** The nav item matching the current path (for header titles/breadcrumbs). */
export function findNavItem(pathname: string): NavItem | undefined {
	return NAV_GROUPS.flatMap((g) => g.items).find((item) => isNavItemActive(item.href, pathname));
}

import { db } from '../db.js';

const live = { status: 'PUBLISHED' } as const;

/** Every public URL with its last change, for /sitemap.xml. */
export async function listSitemapEntries() {
	const [services, packages, posts] = await Promise.all([
		db.service.findMany({ where: live, select: { slug: true, updatedAt: true } }),
		db.tourPackage.findMany({ where: live, select: { slug: true, updatedAt: true } }),
		db.blogPost.findMany({ where: { ...live, publishedAt: { not: null } }, select: { slug: true, updatedAt: true } })
	]);

	const latest = (rows: { updatedAt: Date }[]) =>
		rows.reduce<Date | undefined>((max, r) => (!max || r.updatedAt > max ? r.updatedAt : max), undefined);

	return [
		{ path: '/', lastmod: latest([...services, ...packages]) },
		{ path: '/tours', lastmod: latest(packages) },
		{ path: '/services', lastmod: latest(services) },
		{ path: '/blog', lastmod: latest(posts) },
		{ path: '/gallery' },
		{ path: '/about' },
		{ path: '/contact' },
		...services.map((s) => ({ path: `/services/${s.slug}`, lastmod: s.updatedAt })),
		...packages.map((p) => ({ path: `/tours/${p.slug}`, lastmod: p.updatedAt })),
		...posts.map((p) => ({ path: `/blog/${p.slug}`, lastmod: p.updatedAt }))
	] satisfies { path: string; lastmod?: Date }[];
}

import { listSitemapEntries } from '#lib/server/services/sitemap.js';
import type { RequestHandler } from './$types';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const entries = await listSitemapEntries();
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) =>
			`  <url><loc>${escapeXml(url.origin + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString()}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	setHeaders({ 'cache-control': 'public, max-age=3600' });
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

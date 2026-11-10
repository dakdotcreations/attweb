import type { RequestHandler } from './$types';

// Dynamic so the Sitemap line has the real origin (it must be an absolute URL).
export const GET: RequestHandler = ({ url }) => {
	const body = [
		'User-agent: *',
		'Disallow: /dashboard',
		'Disallow: /auth',
		'Disallow: /api',
		'Disallow: /currency',
		'',
		`Sitemap: ${url.origin}/sitemap.xml`,
		''
	].join('\n');
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
};

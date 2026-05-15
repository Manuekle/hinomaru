import type { RequestHandler } from './$types';

const SITE = 'https://hinomaru.app';

const STATIC_ROUTES: { path: string; changefreq: string; priority: number }[] = [
	{ path: '/', changefreq: 'weekly', priority: 1.0 },
	{ path: '/login', changefreq: 'monthly', priority: 0.7 },
	{ path: '/alphabet', changefreq: 'monthly', priority: 0.9 },
	{ path: '/vocabulary', changefreq: 'weekly', priority: 0.9 },
	{ path: '/jlpt', changefreq: 'weekly', priority: 0.9 },
	{ path: '/conversation', changefreq: 'weekly', priority: 0.8 },
	{ path: '/deck/stories', changefreq: 'weekly', priority: 0.8 },
	{ path: '/deck/songs', changefreq: 'weekly', priority: 0.8 },
	{ path: '/contact', changefreq: 'yearly', priority: 0.4 },
	{ path: '/privacy', changefreq: 'yearly', priority: 0.3 },
	{ path: '/terms', changefreq: 'yearly', priority: 0.3 }
];

const JLPT_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];

export const GET: RequestHandler = async ({ locals }) => {
	const lastmod = new Date().toISOString().slice(0, 10);

	let deckIds: string[] = [];
	try {
		const { data } = await (locals as any).supabase
			?.from('decks')
			.select('id')
			.eq('public', true);
		if (data) deckIds = data.map((d: { id: string }) => d.id);
	} catch {
		// supabase not available at build/render — ignore
	}

	const urls: string[] = [];

	for (const r of STATIC_ROUTES) {
		urls.push(
			`<url>` +
				`<loc>${SITE}${r.path}</loc>` +
				`<xhtml:link rel="alternate" hreflang="es" href="${SITE}${r.path}"/>` +
				`<xhtml:link rel="alternate" hreflang="en" href="${SITE}${r.path}"/>` +
				`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${r.path}"/>` +
				`<lastmod>${lastmod}</lastmod>` +
				`<changefreq>${r.changefreq}</changefreq>` +
				`<priority>${r.priority.toFixed(1)}</priority>` +
				`</url>`
		);
	}

	for (const level of JLPT_LEVELS) {
		urls.push(
			`<url><loc>${SITE}/jlpt/${level}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
		);
	}

	for (const id of deckIds) {
		urls.push(
			`<url><loc>${SITE}/deck/${id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`
		);
	}

	const xml =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
		urls.join('\n') +
		`\n</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};

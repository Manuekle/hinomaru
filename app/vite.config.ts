import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				id: '/',
				name: 'Hinomaru Japanese',
				short_name: 'Hinomaru',
				description: 'Master Japanese with Hinomaru — JLPT N5 to N1',
				lang: 'es',
				dir: 'ltr',
				theme_color: '#BC002D',
				background_color: '#f7f5f2',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/?pwa=1',
				scope: '/',
				categories: ['education', 'productivity', 'books'],
				icons: [
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				],
				shortcuts: [
					{
						name: 'Repasar hoy',
						short_name: 'Repasar',
						url: '/?action=review',
						icons: [{ src: 'icon-192.png', sizes: '192x192' }]
					},
					{
						name: 'Alfabeto',
						short_name: 'Kana',
						url: '/alphabet',
						icons: [{ src: 'icon-192.png', sizes: '192x192' }]
					},
					{
						name: 'JLPT',
						short_name: 'JLPT',
						url: '/jlpt',
						icons: [{ src: 'icon-192.png', sizes: '192x192' }]
					}
				]
			}
		})
	],
	ssr: {
		noExternal: ['@hugeicons/svelte', '@lucide/svelte', 'bits-ui', 'vaul-svelte']
	}
});

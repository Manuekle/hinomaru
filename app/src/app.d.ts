/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/svelte" />

declare module 'virtual:pwa-info' {
	export const pwaInfo:
		| {
				webManifest: {
					href: string;
					linkTag: string;
				};
		  }
		| undefined;
}
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
		}
		interface PageData {
			supabase?: SupabaseClient;
			session: Session | null;
			user: User | null;
			cookies?: { name: string; value: string }[];
		}
	}
}

export {};

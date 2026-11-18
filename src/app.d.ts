// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Currency } from '#lib/format.js';
import type { Session } from '#lib/server/auth.js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Session['user'] | null;
			session: Session['session'] | null;
			/** Visitor's display currency for public prices (cookie, else geo). */
			currency: Currency;
		}
		// interface PageData {}
		interface PageState {
			/** Open lightbox photo (shallow routing), so Back closes it. */
			photo?: string;
		}
		// interface Platform {}
	}
}

export {};

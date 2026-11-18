import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		})
	],
	ssr: {
		// sanitize-html is CommonJS but require()s htmlparser2 v12, which is ESM-only. Node 22+ copes,
		// Vercel's function runtime doesn't (ERR_REQUIRE_ESM on every page). Bundling it converts it
		// to ESM, so htmlparser2 is loaded with `import` instead.
		noExternal: ['sanitize-html']
	},
	optimizeDeps: {
		// Scan every route up front so all deps (simple-icons, gsap, per-icon lucide imports…) are
		// pre-bundled at startup. Otherwise the first visit to a page with a new dep makes Vite
		// re-optimize mid-request: stale chunks 504, the page module fails to load, and Kit shows a 500.
		entries: ['src/routes/**/+*.{svelte,ts}']
	}
});

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (`pnpm-workspace.yaml` sets `engineStrict: true`).

- `pnpm dev` — start the Vite dev server (`pnpm dev -- --open` to open a browser)
- `pnpm build` / `pnpm preview` — production build and preview it
- `pnpm check` — `svelte-kit sync` + `svelte-check` type checking (the only static check; there is no lint or test setup yet)
- `pnpm dlx shadcn-svelte@latest add <component>` — add a shadcn-svelte UI component

## Stack and architecture

SvelteKit 3 + Svelte 5 + TypeScript + Tailwind CSS v4 + shadcn-svelte. `better-auth` is installed but not wired up yet.

- **No `svelte.config.js`.** SvelteKit config (adapter, compiler options) is passed to the `sveltekit()` plugin in `vite.config.ts`. Runes mode is forced for all project files, so use `$props`, `$state`, `$derived`, etc. Legacy `export let` / `$:` syntax will not work.
- **Imports use `#lib`, not `$lib`.** The alias is defined through Node subpath `imports` in `package.json` (`#lib` → `src/lib/index.js`, `#lib/*` → `src/lib/*`). `components.json` uses the same alias, so shadcn components are generated into `src/lib/components/ui/` and import `#lib/utils`.
- **Styling/theme lives in `src/routes/layout.css`** (also the shadcn `tailwind.css` target). It imports Tailwind, `tw-animate-css`, and the shadcn-svelte base, and it defines the design tokens as oklch CSS variables in `:root` and `.dark`. Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`). Fonts: Montserrat (`--font-sans`) and Merriweather (`--font-heading`) via Fontsource. The shadcn style is `maia`, the base color is `stone`, and icons come from `@lucide/svelte`.
- `src/lib/utils.ts` re-exports `cn` from the `cn` package (not clsx/tailwind-merge) plus the `WithElementRef` / `WithoutChild*` prop helper types that shadcn components rely on.
- The adapter is `adapter-auto`. Swap it in `vite.config.ts` once a deploy target is chosen.

## Tooling notes

- The Svelte AI-tools plugin (`svelte@svelte`) is enabled in `.claude/settings.json`. For `.svelte` / `.svelte.ts` work, use the Svelte MCP/skills (`svelte-code-writer`, `svelte-core-bestpractices`) and the project `shadcn-svelte` skill in `.claude/skills/`.

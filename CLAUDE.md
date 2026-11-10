# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (`pnpm-workspace.yaml` sets `engineStrict: true`).

- `pnpm dev` — start the Vite dev server (`pnpm dev -- --open` to open a browser)
- `pnpm build` / `pnpm preview` — production build and preview it
- `pnpm check` — `svelte-kit sync` + `svelte-check` type checking (the only static check; there is no lint or test setup yet)
- `pnpm dlx shadcn-svelte@latest add <component>` — add a shadcn-svelte UI component
- `pnpm db:generate` (client into `src/lib/server/generated/prisma`, gitignored), `pnpm db:migrate` (dev migration), `pnpm db:deploy`, `pnpm db:seed` (upserts the first ADMIN from `SEED_ADMIN_EMAIL`), `pnpm db:studio`

## Stack and architecture

SvelteKit 3 + Svelte 5 + TypeScript + Tailwind CSS v4 + shadcn-svelte, Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`, config in `prisma.config.ts`), better-auth (email OTP).

- **SvelteKit 3 API differences:** env vars are declared with zod schemas in `src/env.ts` (`defineEnvVars`) and imported from `$app/env/private` (not `$env/*`). `building`/`dev` come from `$app/env`; `Handle` from `@sveltejs/kit/hooks`; `SubmitFunction` from `$app/forms`. Scripts outside Kit (`prisma.config.ts`, `prisma/seed.ts`) read `process.env` via `dotenv`.
- **Auth:** `src/lib/server/auth.ts` sets up better-auth (`emailOTP` with `disableSignUp`, `role` additional field, `sveltekitCookies` plugin last so `auth.api.*` calls in form actions set cookies). `hooks.server.ts` puts `user`/`session` on `locals`, redirects unauthenticated `/dashboard/*` requests, and serves `/api/auth/*`. Login/verify are form actions calling `auth.api` server-side. Per-route role checks use `requireUser()` / `requireRole()` / `requireAdmin()` from `src/lib/server/guards.ts`. Call them in form actions too, because layout loads don't run before actions. ADMIN-only pages live under `routes/(private)/dashboard/(admin)/`.

- **No `svelte.config.js`.** SvelteKit config (adapter, compiler options) is passed to the `sveltekit()` plugin in `vite.config.ts`. Runes mode is forced for all project files, so use `$props`, `$state`, `$derived`, etc. Legacy `export let` / `$:` syntax will not work.
- **Media:** images upload one file per request to `dashboard/media/upload` (limit `MAX_UPLOAD_BYTES` = 4 MB in `src/lib/media.ts`, because Vercel caps request bodies at 4.5 MB). `lib/server/media/process.ts` validates by decoding with sharp (JPEG/PNG/WebP/AVIF/GIF, ≤50 MP). With `compress` it converts to WebP, caps at 2560px and strips metadata; without it the original bytes are stored. A 480px WebP thumbnail is always made. Blobs go to Azure (`lib/server/storage/azure.ts`, public container); `lib/server/services/media.ts` owns the DB + blob lifecycle. Content forms pick images with `components/admin/media/media-picker.svelte`.
- **Content forms (dashboard CRUD):** no superforms (it needs `$app/stores`, removed in Kit 3). The form component keeps its values in `$state`, and `JsonForm` (`lib/admin/json-form.svelte.ts`) submits them as one JSON `payload` field to `?/save`. The action calls `parseJsonPayload(request, schema)` (`lib/server/forms.ts`), and zod issues come back as `errors` keyed by dot path (`prices.0.amountUSD`). Each entity uses one `[id]` route where `id === 'new'` creates; create redirects to the new id, and the page wraps the form in `{#key id}`. Schemas live in `lib/schemas/*` (shared with the client), DB access in `lib/server/services/*`. Rich text is TipTap HTML, sanitized with `sanitizeRichText` before saving. Packages save their child rows (prices, lists, gallery, service tags) by replace-all inside one transaction.
- **Inquiries (ADMIN-only, under `(admin)/inquiries`):** create them through `createInquiry()` in `lib/server/services/inquiries.ts` (the public form should use it too, with `source: 'WEBSITE'`). Status changes go through `changeInquiryStatus()`, which writes a STATUS_CHANGE entry to the `InquiryNote` timeline in the same transaction. `travelDate` is a date-only value at UTC midnight: display it with `formatDateOnly`, not `formatDate`. Labels, statuses and the `wa.me` link helper live in `lib/inquiries.ts`.
- **Svelte gotcha:** never `bind:` a value that can be `undefined` to a component prop with a fallback, such as `bind:ref={refs[i]}` on shadcn components (`ref = $bindable(null)`). Svelte throws `props_invalid_value` at runtime, and SvelteKit shows it as a 500. Look elements up in the DOM instead, or initialise the bound value.
- **Imports use `#lib`, not `$lib`.** The alias is defined through Node subpath `imports` in `package.json` (`#lib` → `src/lib/index.js`, `#lib/*` → `src/lib/*`). `components.json` uses the same alias, so shadcn components are generated into `src/lib/components/ui/` and import `#lib/utils`. Subpath imports don't resolve extensions, so always write the file explicitly: `#lib/server/auth.js`, `#lib/components/ui/button/index.js`.
- **Styling/theme lives in `src/routes/layout.css`** (also the shadcn `tailwind.css` target). It imports Tailwind, `tw-animate-css`, and the shadcn-svelte base, and it defines the design tokens as oklch CSS variables in `:root` and `.dark`. Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`). Fonts: Montserrat (`--font-sans`) and Merriweather (`--font-heading`) via Fontsource. The shadcn style is `maia`, the base color is `stone`, and icons come from `@lucide/svelte`.
- `src/lib/utils.ts` re-exports `cn` from the `cn` package (not clsx/tailwind-merge) plus the `WithElementRef` / `WithoutChild*` prop helper types that shadcn components rely on.
- The adapter is `adapter-auto`. The deploy target is Vercel (Postgres on Railway), so switch to `adapter-vercel` in `vite.config.ts` before deploying.

## Tooling notes

- The Svelte AI-tools plugin (`svelte@svelte`) is enabled in `.claude/settings.json`. For `.svelte` / `.svelte.ts` work, use the Svelte MCP/skills (`svelte-code-writer`, `svelte-core-bestpractices`) and the project `shadcn-svelte` skill in `.claude/skills/`.

# =============================================================================
# ALTURA TOURS & TRAVEL PROJECT CONTEXT =============================================================================

## Project Overview

This project is a custom-built tourism and travel management platform for Altura Tours & Travel.

The platform has two primary goals:

1. Build credibility and trust through a premium tourism website.
2. Generate and manage customer inquiries through an internal admin system.

This is not a booking marketplace and is not intended to compete with portals such as Booking.com, Expedia, or Airbnb.

Version 1 focuses on:

- Marketing
- Lead generation
- Content management
- Inquiry management

Version 1 does NOT include:

- Online payments
- Customer accounts
- Customer dashboards
- Mobile money
- Card payments
- Travel inventory management
- Airline APIs
- Hotel APIs
- Day-by-day itinerary builders
- Automated quotation systems

---

# Technology Stack

## Frontend

- SvelteKit
- TypeScript
- TailwindCSS
- Lucide Icons

## Components

### Admin Area

Use:

- shadcn-svelte

### Public Website

DO NOT use shadcn-svelte as the primary design system.

Public-facing pages should use custom components and custom styling to create a unique travel brand experience.

---

## Backend

Everything is self-contained inside SvelteKit.

Use:

- Server Actions
- Server Routes

DO NOT build a separate backend.

DO NOT introduce FastAPI or external backend services.

---

## Database

- PostgreSQL
- Prisma

---

## Package Manager

- pnpm

---

# Authentication

Use:

- better-auth

Authentication method:

- Email OTP only

DO NOT implement passwords.

DO NOT implement public registration.

Only pre-created users can authenticate.

---

## Login Flow

Email
→ Verify user exists
→ Generate OTP
→ Send Email
→ Verify OTP
→ Create Session
→ Redirect to Dashboard

---

## Roles

enum UserRole:

- ADMIN
- EDITOR

### ADMIN

Can manage:

- Users
- Settings
- Services
- Tours
- Blog
- Testimonials
- Inquiries
- Media

### EDITOR

Can manage:

- Services
- Tours
- Blog
- Testimonials
- Media

Cannot:

- Manage users
- Manage application settings

---

# Routing Structure

Use route groups.

```text
src/routes/

(public)
(auth)
(private)
```

---

## Public

Contains:

```text
/
about
services
tours
gallery
blog
contact
```

Uses public layout.

No authentication.

---

## Auth

Contains:

```text
/auth/login
/auth/verify
```

Uses auth layout.

No sidebar.

No dashboard navigation.

---

## Private

Contains:

```text
/dashboard

/dashboard/services
/dashboard/packages
/dashboard/media
/dashboard/blog
/dashboard/testimonials
/dashboard/inquiries
/dashboard/settings
/dashboard/users
```

Requires authentication.

Uses dashboard layout.

---

# Storage

Use:

- Azure Blob Storage

---

## Image Uploads

Every upload should support:

```ts
compress: boolean
```

If:

```ts
compress === true
```

Process:

Upload
→ Validation
→ Compression
→ Optimization
→ Azure Blob

Use:

```ts
sharp
```

for image processing.

---

# Currency System

The application supports:

- UGX
- USD

Do NOT use exchange-rate conversion.

Store both values directly in the database.

Example:

```text
UGX 3,500,000
USD 950
```

The business controls both prices.

---

## Currency Detection

Default:

```text
Uganda → UGX

Everywhere Else → USD
```

---

## Currency Override

Provide a currency switcher.

Store preference in cookies.

Manual selection always wins.

---

# Database Models

Authentication:

- User
- Session
- OtpCode

Business:

- Service
- TourPackage
- PackagePrice
- TourHighlight
- TourInclusion
- TourExclusion
- Inquiry
- Testimonial
- Media
- PackageGalleryImage
- BlogPost
- SiteSettings

---

# Development Order

## Phase 1

Authentication

Build:

- better-auth integration
- OTP login
- Session handling
- Role system
- Protected layouts

Nothing else before auth.

---

## Phase 2

Admin Dashboard

Build:

- Dashboard shell
- Sidebar
- Navigation
- Authentication guards

---

## Phase 3

Media System

Build:

- Azure uploads
- Compression
- Media library

Media must be completed before services/packages.

---

## Phase 4

Content Management

Build:

- Services
- Packages
- Pricing
- Blog
- Testimonials
- Settings

---

## Phase 5

Inquiry Management

Build:

- Inquiry listing
- Status updates
- Search
- Filters

---

## Phase 6

Public Website

Build:

- Homepage
- Services
- Package pages
- Blog
- Gallery
- Contact

Only begin public website after admin functionality is complete.

---

# UI Philosophy

Public Website:

- Premium
- Trustworthy
- Travel-focused
- Content-driven
- Strong imagery
- Safari-inspired
- Professional healthcare presentation for Medical Tourism

Admin System:

- Functional
- Minimal
- Fast
- Business-oriented

---

# Brand Colors

Primary:

```text
#0F4C81
```

Travel Blue

Secondary:

```text
#F4B400
```

Safari Gold

Accent:

```text
#22C55E
```

WhatsApp Green

Neutral:

```text
#F8FAFC
#1F2937
```

---

# Important Constraints

Do NOT build:

- Online payments
- Mobile money
- Card processing
- Customer accounts
- Customer dashboards
- Day-by-day itineraries
- Hotel booking engines
- Flight booking APIs
- Inventory systems

Tour packages should consist of:

- Description
- Duration
- Pricing
- Highlights
- Inclusions
- Exclusions
- Gallery
- Inquiry CTA

NOT itinerary builders.
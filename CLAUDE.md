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
- **Request forms (flights, study abroad):** a service's `formType` (GENERAL | FLIGHT | STUDY_ABROAD, set in the service editor) picks the form its page shows at `#inquire`: `components/public/request-forms/flight-request-form.svelte` or `study-request-form.svelte` (both wrap `request-form-shell.svelte`). They still post to `/contact` with a hidden `kind`. `submitPublicInquiry()` validates the kind's fields with `lib/schemas/inquiry-details.ts`, stores them in `Inquiry.details` (JSON) and fills `travelDate`/`groupSize`/`interest` so the list keeps working. Study choices (1–3, ranked) are `InquiryInstitution` rows that snapshot name/country. Partner institutions are managed at `/dashboard/institutions` (ADMIN + EDITOR). Study abroad falls back to the general form until an institution is published. `/contact?service=<slug>` redirects to the service page when the service has a special form.
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
/dashboard/institutions
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

# Brand (from the logo and flyers; supersedes the earlier Travel Blue palette)

The logo is a grey crowned crane with ribbons in the Uganda flag colours and a Trajan-style "ALTURA" wordmark. Tagline: **"Your journey, our passion"**. The public site uses these as Tailwind utilities defined in `src/routes/layout.css` (`@theme`), separate from the shadcn tokens the dashboard uses:

- **Forest green** (primary): `forest-800` #0B4D2C, with 950/900/700/600/100 shades
- **Gold** (accent): `gold-500` #C9A23A, with 600/400/300/100 shades. Only for accents and large text on forest, never small text on cream.
- **Cream** background: `cream` #FBF7EA. Ink: `ink` #1F2937.
- **Crane red** `crane-red` #C8102E: tiny accents only.
- **WhatsApp green** `whatsapp` #22C55E: WhatsApp buttons only.
- Utilities: `gold-rule`, `gold-text`, `gold-border` (set `--gold-border-fill` for the inner background).

**Fonts:** Cinzel (`font-heading`) for display and section headings; Montserrat (`font-sans`) for everything else, including bold destination titles and price badges.

**Logo files** go in `static/brand/` (`logo-full.png`, `logo-full-light.png`, `logo-mark.png`). The `Logo` component falls back to a Cinzel wordmark when they're missing.

**Audience order:** inbound safaris (gorillas, wildlife) first. Then outbound holidays for Ugandans (Mombasa, Egypt, Dubai, Turkey…), flights and hotels, visas, medical tourism (India), study abroad, school tours, corporate travel and car hire.

**Public site motion:** GSAP via `useGsap` (`src/lib/hooks/UseGsap.svelte.ts`).
- ScrollSmoother is set up once in `(public)/+layout.svelte`. Fixed elements (header, WhatsApp button, mobile menu) must stay outside `#smooth-wrapper`.
- Respect `reducedMotion` (no smoother, no animations).
- Animate only transform and opacity.
- Never hide content in CSS waiting for JS: first-paint intros are CSS keyframes, and GSAP handles later interactions.

**Public inquiries:** every public form posts to the `/contact` default action, which calls `submitPublicInquiry()` (`lib/server/services/public-inquiry.ts`). It handles:
- spam traps: a hidden `website` honeypot and a 3s `startedAt` time trap, both answered with a fake success
- a limit of 3 per email/phone per 10 minutes
- linking only to published packages/services
- an email to Settings `inquiryEmail` (falling back to `email`), plus a confirmation to the customer

Email failures never fail the submission. Use `lib/components/public/inquiry-form.svelte` (it also works without JS).

**Inside ScrollSmoother:**
- CSS `position: sticky` and `fixed` don't work in `#smooth-content`. Pin with ScrollTrigger via `useGsap(..., scope, { afterSmoother: true })`.
- Move fixed bars to `<body>` with the `portal` attachment.
- Same-page `#hash` links are intercepted in `(public)/+layout.svelte` and scrolled smoothly.
- Native `<dialog>` (top layer) is fine for overlays.
- Pages with a fixed mobile booking bar return `bookingBar: true`, which moves the WhatsApp button up.

**Currency:** `locals.currency` comes from the `currency` cookie, otherwise `x-vercel-ip-country` (UG → UGX, else USD). It's switched via POST `/currency`. Show prices with the public `PriceTag`, which falls back to the other currency if one is missing.

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
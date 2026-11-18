# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Public website visitors**, in business priority order:

1. **International safari travellers** (wildlife enthusiasts, adventure and luxury travellers) researching guided wildlife tours and gorilla trekking in Uganda. They think in USD and want confidence that a distant operator is real and competent before they inquire.
2. **Ugandan residents** planning outbound holidays (Mombasa, Egypt, Dubai, Turkey…), flights and hotels, or visas. They think in UGX and usually want to talk to someone on WhatsApp.
3. **Medical tourism clients**, both Ugandan and international, arranging treatment abroad (mainly India): hospital referrals, treatment arrangements, medical visas and travel coordination. They are often anxious and need calm, factual reassurance.
4. **Study abroad applicants** (Ugandan school leavers, university applicants, working professionals; Malaysia first), looking for consultation and application help.
5. **Schools and institutions** booking educational group trips and asking for quotations.
6. Corporate travellers and car hire / airport transfer clients.

**Dashboard operators:** a small office team working mostly at office desktops, and replying to inquiries from their phones. ADMINs manage users, settings and inquiries; EDITORs manage services, tours, blog, testimonials and media.

## Product Purpose

A marketing and lead-generation website for Altura Tours & Travel Limited, backed by an internal admin system for content and inquiries. The site exists to establish credibility, show the full range of services, and turn visitors into inquiries on WhatsApp, email or the inquiry form.

Success is more inquiries, more WhatsApp and email contacts, and a stronger professional image. It is not account sign-ups, online payments or self-service bookings.

## Positioning

- **Personal service.** Customers deal directly with real people at Altura over WhatsApp and email, and trips are tailor-made. There is no booking-portal friction; the website hands visitors to a person.
- **One trusted team for any trip.** Safaris and gorilla treks, outbound holidays, flights, visas, study abroad, school tours, corporate travel, car hire and airport transfers all come from one company.
- **Medical tourism** is a distinctive offer few local tour operators provide, and it must be presented with healthcare-grade seriousness rather than holiday promotion.

## Operating Context

- Customer conversations happen primarily on WhatsApp, then email. The site should make reaching the team easy, never force a complicated process.
- Public forms post to `/contact` and create Inquiries that the office team works through in the dashboard (status timeline, notes, `wa.me` links).
- Prices are entered by the business in both UGX and USD; no exchange-rate conversion. Visitors in Uganda see UGX by default, everyone else USD, with a manual switcher that always wins.
- The blog is the main long-term SEO channel (gorilla trekking and safari guides, medical tourism, visa guides, study abroad, school trip planning).
- Company is based on Kampala Road, Kampala, Uganda.

## Capabilities and Constraints

- Stack: SvelteKit 3 / Svelte 5, Prisma + PostgreSQL, better-auth email OTP (no passwords, no public registration), Azure Blob for media, sharp for image processing. Public site uses custom components; shadcn-svelte is for the dashboard only.
- Tour packages consist of overview, duration, pricing, highlights, inclusions, exclusions, gallery and an inquiry CTA. No day-by-day itineraries.
- All services, including medical tourism, share one service page template. Tone differences live in the content written in the dashboard, not in a separate layout.
- Version 1 excludes: online, card or mobile-money payments; customer accounts or dashboards; booking engines; airline or hotel APIs; inventory; automated quotations. These may come later and should not shape V1.
- Terminology: "Tours" / "packages" for tour packages, "Services" for the service lines, "Inquiries" for leads.

## Brand Commitments

- Name: **Altura Tours & Travel** (legal: Altura Tours & Travel Limited). Tagline: **"Your journey, our passion"**.
- Logo: grey crowned crane with Uganda-flag ribbons and a Trajan-style "ALTURA" wordmark (`static/brand/logo-full.webp`, `logo-full-light.webp`, `logo-mark.webp`).
- Brand palette and fonts are already defined (see CLAUDE.md "Brand"); visual decisions are owned by DESIGN.md / new-work, not this file.
- Voice: warm, professional and trustworthy. Safari pages can be evocative; medical tourism and visa content stays calm, factual and non-promotional; study abroad and school tours are informative and institutional.
- Vision, mission and objectives come from Altura's printed brochure (`src/lib/components/public/about-content.ts`).

## Evidence on Hand

- **Uganda Tourism Association membership**: confirmed, may be shown.
- **Real customer testimonials**: genuine, entered through the dashboard. Only show testimonials from the database; never write placeholder ones.
- **Altura's own photography**: available and preferred over stock for trips and destinations.
- **Brochure copy**: vision, mission, objectives, impact and full service list (`about-content.ts`).
- **Awards: not confirmed.** The "Multiple award-winning tour operator" badge was removed on 2026-11-11. Do not add award claims unless a specific named award and year is confirmed.
- Do not invent traveller counts, years in business, ratings, partner logos, accreditations or hospital partners.

## Product Principles

1. **Every page leads to a person.** The goal is a WhatsApp message, email or inquiry, never a checkout.
2. **Trust before persuasion.** Show real evidence only; credibility matters more than hype, and most of all for medical and visa services.
3. **Match each audience's tone.** Safari pages inspire, healthcare pages reassure, and education pages inform.
4. **Keep it simple to run.** A small team maintains the content, so features and content models stay low-maintenance.
5. **Both currencies are first-class.** UGX and USD prices are set by the business and shown as-is.

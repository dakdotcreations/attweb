---
name: Altura Tours & Travel
description: Your journey, our passion. Public website design system ("Full-Bleed Journeys").
colors:
  forest-950: "#062b19"
  forest-900: "#0b3d24"
  forest-800: "#0b4d2c"
  forest-700: "#145f38"
  forest-600: "#1f7547"
  forest-100: "#e3efe7"
  gold-600: "#a8841f"
  gold-500: "#c9a23a"
  gold-400: "#ddbb5c"
  gold-300: "#ead18a"
  gold-100: "#f7edd0"
  paper: "#fbfbf8"
  engrave: "#1e2a22"
  ink: "#1f2937"
  cream: "#fbf7ea"
  crane-red: "#c8102e"
  whatsapp: "#22c55e"
  whatsapp-dark: "#16a34a"
typography:
  display:
    fontFamily: "Oswald Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(3.25rem, 7vw, 6.25rem)"
    fontWeight: 600
    lineHeight: 0.92
  headline:
    fontFamily: "Oswald Variable, Arial Narrow, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 0.95
  title:
    fontFamily: "Oswald Variable, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 0.95
  numeral:
    fontFamily: "Oswald Variable, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  lead:
    fontFamily: "Montserrat Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Montserrat Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.16em"
  button:
    fontFamily: "Montserrat Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  wordmark:
    fontFamily: "Cinzel Variable, Times New Roman, serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.2em"
rounded:
  card: "0.7rem"
  pill: "9999px"
spacing:
  hairline: "3px"
  gutter: "1rem"
  gutter-lg: "2rem"
  card-gap: "1.5rem"
  section: "5rem"
  section-lg: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.forest-900}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.forest-900}"
  button-outline:
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 24px"
  button-outline-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.forest-950}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-whatsapp-hover:
    backgroundColor: "{colors.whatsapp-dark}"
  icon-button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    size: "48px"
  icon-button-ring:
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    size: "48px"
  photo-card:
    backgroundColor: "{colors.forest-800}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    padding: "20px"
  ticket-stub:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.engrave}"
    padding: "16px 20px 12px"
  currency-toggle-active:
    backgroundColor: "{colors.forest-800}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Altura Tours & Travel

## Overview

**Creative North Star: "Full-Bleed Journeys"**

Uganda's journeys are shown as photography that fills the screen, with the place's name set huge in condensed capitals over it. The card is the photo itself: name, place and a short gold dash sit on the picture under a dark scrim. Pages switch between light and dark sections for a calm, premium rhythm: dark forest bands (heroes, feature bands, the closing ask) alternate with light paper reading sections, so no page is all dark. The stamp heritage of the earlier iteration survives only as one-sided details: a perforated left edge on the hero's queued cards, a perforated paper ticket stub along the bottom of tour cards, and circular postmarks for provenance.

The homepage opens on a full-bleed service slider that plays through every published service on its own: the current service's name and actions on the left, the services coming up queued on the right as portrait photo cards running off the screen edge, and below them round previous/next buttons, pause, a gold progress line and a big slide number. On each step the first queued card grows from its own rectangle into the background. Controls are pills and round icon buttons. Nothing casts a shadow. Everything is visible before JavaScript arrives; first-paint motion is CSS, later motion is transform and opacity, plus the clip-path handover.

Scope: this system covers the public website. The dashboard keeps the stock shadcn-svelte tokens (stone base, maia style, `--radius` 0.875rem) in the same stylesheet; do not mix the two. The older page heroes (tours, services, blog, contact, about) set in Cinzel with eyebrows, the PlanCta panel, the inquiry form's white rounded panel, white rounded content cards with soft shadows on detail pages, the gradient PriceTag, and the blog postcard are legacy awaiting migration, not part of the system. Confirmed visual rejections: boxed white cards, stacked badges, icon grids, price-led heroes, the booking-portal look and the clinical hospital look.

**Key Characteristics:**
- Full-bleed photographs under dark scrims; the photo is the card.
- Oswald condensed uppercase for every name, heading and numeral; Montserrat for reading.
- A short gold dash above every title.
- Pill buttons and round icon buttons; one gold progress line.
- White paper only on one side of a card (the ticket stub), never framing a photo.
- Flat: no shadows. Gradients only as photo scrims and the 1px gold rule.

## Colors

Deep forest grounds and full-colour photography, with paper for type, gold for small marks, and WhatsApp green for the one action that matters most.

### Primary
- **Forest Ground** (forest-950 / forest-900): dark sections (heroes, feature bands such as journeys-on-dark, objectives and quotes, the closing call to action); forest-950 is also the hero's ground behind photos and the gallery page.
- **Paper Ground** (paper, paper-200 #eceee6): light reading sections, alternating with the forest bands; paper-200 separates two light sections that meet. Text on paper is forest-950 for headings and ink at 70–85% for body.
- **Card Forest** (forest-800): the image well behind every photo card and queue card (shows while photos load or when none exists), the active segment of the dark currency toggle.
- **Forest Text** (forest-700 / forest-900): text on paper: forest-700 for the stub's "FROM USD" line, forest-900 for the price numeral and primary button text. Forest-600 is the solid header's link hover; forest-100 the dark currency toggle track.

### Secondary
- **Dash Gold** (gold-400): the title dash, the hero progress line, focus outlines and rings (60 to 70%).
- **Link Gold** (gold-300, gold-100 on hover): onward links on forest ("See the album", testimonial journey links), postmarks on forest (at 60 to 80%), the active header link over the hero, the primary button's hover.
- **Rule Gold** (gold-500): the active header link underline on cream, the 1px gold rule.

### Tertiary
- **WhatsApp Green** (whatsapp / whatsapp-dark): WhatsApp actions only.
- **Crane Red** (crane-red): tiny accents and form errors only.

### Neutral
- **Paper** (paper): type on forest and photos (at 65 to 80% for secondary copy), the primary button, the ticket stub, outline and ring borders (at 25 to 60%).
- **Engraving Ink** (engrave): text on the ticket stub (at 65% for the price label).
- **Ink** (ink): running copy on light legacy surfaces.
- **Cream** (cream): the solid header after scroll, the mobile menu and the light currency toggle segment. Not for new surfaces.

### Named Rules
**The Gold-On-Forest Rule.** Gold sits on forest or on scrimmed photos only. On paper and cream, prices and active marks are forest text, with gold allowed only as a 2px underline.

**The Single Duty Rule.** WhatsApp green appears only on WhatsApp actions; crane red only as tiny accents and error text.

## Typography

**Display Font:** Oswald Variable (with Arial Narrow, sans-serif)
**Body Font:** Montserrat Variable (with ui-sans-serif, system-ui)
**Wordmark Font:** Cinzel Variable (with Times New Roman, serif)

**Character:** Oswald is tall, condensed and loud: the place names and headings are set the way the reference sets destinations, uppercase and tightly led. Montserrat does all the reading and every control. Cinzel belongs to the logo's Trajan-style wordmark and is echoed only in the footer column heads and tagline.

### Hierarchy
- **Display** (Oswald 600, 3.25rem → 4.5rem → 6.25rem, line-height 0.92, uppercase, balanced): the current service name in the hero only.
- **Headline** (Oswald 600, 3rem → 3.75rem, up to 4.5rem for the closing ask, line-height 0.95, uppercase): section headings in the left column.
- **Title** (Oswald 600, line-height 0.95, uppercase, balanced): card titles on the photo: 1.5rem → 1.875rem on standard cards, 1.25rem → 1.5rem on square service cards, 2.25rem → 3rem on the large lead card, 1rem → 1.25rem on hero queue cards; testimonial names at 1.125rem with wide tracking.
- **Numeral** (Oswald 600, tabular): the stub price (1.875rem, 2.25rem on the lead card) and the hero slide number (2.25rem → 3rem, zero-padded "01").
- **Lead** (Montserrat 400, 1.125rem, line-height 1.625, max ~24rem to 32rem): section intros and the hero summary (1rem → 1.125rem, clamped to three lines), paper at 75 to 80%.
- **Body** (Montserrat 400, 1rem): running copy; 0.875rem for card meta and the office details.
- **Label** (Montserrat 700, 0.75rem, 0.16em tracking, uppercase): the ticket stub's duration ("3 DAYS") and currency line ("FROM USD").
- **Button** (Montserrat 600 to 700, 0.875rem): every button and onward link.

### Named Rules
**The Condensed Caps Rule.** Anything that is a name (a service, a place, a journey, a section) or a big number is Oswald uppercase. Anything read as a sentence, and every control label, is Montserrat.

**The Wordmark Stays Put Rule.** Cinzel is the logo's voice. Outside the logo it appears only in the footer column heads and tagline; it is not a heading face for new surfaces.

## Layout

A 12-column grid inside a 1280px container (max-w 7xl) with 1rem / 1.5rem / 2rem gutters. Homepage sections use a 4/8 split at large widths: gold dash, heading, lead and an outline pill in the left four columns (offset 1rem down), cards or quotes in the right eight; the closing ask splits 6/6 with the photo album. Sections breathe at 5rem vertical padding, 7rem from the small breakpoint. Everything stacks to one column on phones.

The hero is full-bleed: 100svh, min 40rem, no inset or border. At large widths the copy takes five columns and the queue seven, both bottom-aligned; the queue row is not clipped by its column and runs off the right edge of the screen, cut only by the section. Queue cards are 6rem / 10rem / 13rem wide at 5:8, with 0.75rem / 1.25rem gaps. On phones the copy sits low over the photo and the queue shrinks to a strip beneath it.

Card collections fill by count: the lead journey card spans two columns unless there are exactly two; cards gap 1.25rem / 1.5rem. Photo strips and the gallery run edge to edge in justified rows: each tile grows by its own aspect ratio (`flex: r 1 calc(r * row)`), 3px gaps, row height 7.5rem / 11rem / 15rem (gallery) and 11rem / 15rem / 19rem (homepage album), with an invisible spacer so the last row does not stretch. Gallery months group under a small postmark heading.

## Elevation & Depth

The system is flat. There are no shadows. Depth comes from photography under scrims: dark gradients (black at 70% to 10% left to right, plus 60% from the bottom and 40% from the top, and a heavier bottom scrim on phones) keep paper type legible over any photo. Section changes are tonal, forest-950 against forest-900. The solid header separates from the page with a 1px gold hairline at 35%, drawn as an inset line, not a shadow.

### Named Rules
**The Scrim-Only Gradient Rule.** Gradients exist to make type readable over photographs, plus the 1px gold rule. Never a gradient fill on a button, badge or surface.

**The No-Lift Rule.** Nothing casts a shadow. A card stands forward because it is a photograph on forest.

## Shapes

Photo cards and queue cards have gently rounded corners (0.7rem); the hero's handover animation clips from the card's rectangle at a 6px radius out to square full-bleed. Every control is round: pill buttons, pill currency toggle, 48px circular icon buttons (44px on phones). The perforation is a single-edge detail: semicircle holes (3.5px radius, 13px pitch) punched down the left edge of hero queue cards, or across the top edge of a tour card's ticket stub, showing whatever is behind. Masks clip outlines, so queued cards drop their mask on keyboard focus to show the outline, and photo cards draw focus on the article. The postmark is the only other circle: a double ring with arched place and country lettering, an optional date across the centre and optional wavy cancel lines.

### Named Rules
**The One Paper Side Rule.** White paper touches a card on one side only: the perforated ticket stub along the bottom of a tour card. Paper never frames a photo on all sides.

## Components

### Buttons
Rounded and confident, like the reference: pills for words, circles for icons.
- **Shape:** fully rounded (9999px).
- **Primary ("Plan my trip"):** paper with forest-900 text, Montserrat 700 0.875rem, 14px 28px padding, trailing arrow. Hover shifts to gold-300; focus shows a 4px gold-400 ring at 70%.
- **Outline ("Explore {service}", "All journeys", gallery footer):** 48px tall, 1px paper border at 50 to 60%, paper text, trailing arrow; hover fills with paper and turns the text forest-950.
- **WhatsApp:** WhatsApp green with white text and the WhatsApp mark; sizes sm (header), md, lg; hover deepens to whatsapp-dark; focus ring whatsapp at 50%. Always beside the primary on a closing ask.
- **Round icon buttons:** the hero's WhatsApp circle (48px, solid WhatsApp green, white mark) beside the Explore pill; previous/next circles (44 to 48px, 1px paper border at 40%, paper at 10% on hover); pause/play as a borderless circle at paper 70%. Lightbox controls use the same circles filled with paper at 10%.
- **Text link:** gold-300 bold 0.875rem with an arrow that nudges right on hover; onward links on forest.

### Service Slider (signature component)
The homepage hero. Full-bleed photo of the current service with a slow 14s settling zoom (1.08 → 1); gold dash (40 × 2px), display-size name, three-line summary, then the round WhatsApp button and the Explore pill. The queue of upcoming services loops so the row always runs off the edge; each queue card is a portrait photo card (5:8, rounded 0.7rem, perforated left edge, bottom scrim, 20 × 1px gold dash, Oswald name) and is itself a button that jumps to that service. Advancing grows the chosen queue card's rectangle into the background (clip-path, 950ms, cubic-bezier(0.7, 0, 0.2, 1)) while the queue slides along (flip, 700ms); going back crossfades. Below the queue: prev, next, pause, a 1px paper-at-25% track with a gold-400 progress fill over each 6.5s slide, and the zero-padded slide number. Autoplay pauses on hover, focus within and hidden tabs; swipe works on touch. Reduced motion keeps autoplay but swaps instantly.

### Photo Card
The card for journeys and services. The photo fills the card (portrait 4:5, square for services, 4:5 → 16:10 for the large lead card) over a forest-800 well, with a bottom scrim (black 80% → 15% → transparent). On the photo: a 24 × 2px gold dash, the Oswald title, and a 0.875rem meta line (place or service) in paper at 80%. Corners 0.7rem. The whole card is the link via a stretched title link; hover slowly scales the photo to 1.05 over 1.2s; keyboard focus draws a 2px gold-400 outline offset 3px around the card. No photo: the crane mark at 30% in greyscale, never an empty box.
- **Ticket stub (tour cards only):** a paper strip along the bottom with a perforated top edge. Left: the duration in label style (forest-800) over the price label (engrave 65%). Right: "FROM USD" in label style (forest-700) above the Oswald price numeral (forest-900), in the visitor's currency with fallback to the other.
- **Service cards** have no stub.

### Letters Home (testimonials)
Quotes set directly on forest-950, no card: a 1px paper-at-15% top rule, a gold-300 postmark at 60% (traveller's place, "ALTURA", month received) rotated in the top right, the quote in Montserrat 1.125rem (1.25 → 1.5rem when alone), the name in Oswald uppercase, the place in paper 65%, and a gold-300 link to the published journey. Up to two; the section hides without real testimonials.

### Postmark
The provenance device, drawn in currentColor (gold-300 at 60 to 80% on forest): testimonial provenance, the Kampala Road office block in the closing section, gallery month headings, the empty gallery state. Decorative unless it carries information.

### Album Strip and Gallery
True-aspect photos in justified rows with 3px gaps over forest-900 wells. On the homepage the strip is one link to the gallery with a gold "See the album" link beneath. The gallery adds underlined text filters (active: paper with a 2px gold-400 underline), month groups under postmarks, a lightbox (native dialog, round controls), and a paper "Load more photos" pill.

### Navigation
A fixed header outside the smooth-scroll wrapper. Over the hero it is transparent with cream text and the light logo; links are Montserrat 600 0.875rem pills, the active link gold-300, hover gold-300. Once scrolled it turns cream at 95% with forest-900 text and the gold hairline; the active link is forest-950 with a 2px gold-500 underline (offset 8px), hover forest-600. The currency toggle and a small WhatsApp pill sit at the right; on phones a full-height cream menu lists links.

### Currency Toggle
A two-segment pill form (works without JS). Light tone over photos: white at 15% track with a white-at-25% ring, active segment cream with forest-900 text. Dark tone on cream: forest-100 track, active segment forest-800 with cream text.

### Inputs / Fields
Not yet migrated. The shipped inquiry form uses the pre-world white rounded panel; legacy, not a pattern to copy.

## Do's and Don'ts

### Do:
- **Do** let the photograph be the card: title, dash and meta on the photo under a bottom scrim.
- **Do** set names, headings and big numbers in Oswald uppercase with tight leading (0.92 to 0.95), and mark every title with a short gold dash.
- **Do** alternate light (paper / paper-200) and dark (forest-900 / forest-950) sections; heroes and the closing call to action are dark, reading content is light. Never build a page that is dark from top to bottom.
- **Do** use pills for worded buttons and circles for icon buttons; pair "Plan my trip" with WhatsApp on every closing ask.
- **Do** keep white paper to one side of a card, the perforated ticket stub, carrying duration and the "from" price.
- **Do** use the postmark for provenance (place and month).
- **Do** keep photographs at their true aspect in justified rows with 3px gaps.
- **Do** animate only transform, opacity and clip-path handovers; land first-paint motion with CSS; let any autoplay pause on hover, focus and hidden tabs, and offer a pause button.

### Don't:
- **Don't** use shadows; depth is photography and tonal forest.
- **Don't** use gradients except photo scrims and the 1px gold rule.
- **Don't** frame a photo in white paper on all sides, or build boxed white cards.
- **Don't** put eyebrow or kicker text above headings; the gold dash is the only mark above a title.
- **Don't** set gold text on paper or cream.
- **Don't** use WhatsApp green for anything but WhatsApp actions, or crane red beyond tiny accents and errors.
- **Don't** lead a hero with a price, or add stacked badges, ratings, urgency labels or icon grids.
- **Don't** use Cinzel as a heading face on new surfaces, or shadcn-svelte components and dashboard tokens on public pages.

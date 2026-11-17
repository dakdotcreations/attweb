# Website content: services, packages, articles

Copy-ready content for the dashboard, built from the company profile PDF (`pdf24_converted.pdf`) and `docs/business-context.md`. There is one file per service, and each file holds (#5 has four packages and two articles, because visa assistance was folded into it):

1. **Service**: name, slug, summary, SEO and body content
2. **Package 1 and Package 2**: every package form field, including price tiers, highlights, inclusions and exclusions
3. **Article**: a blog post linked to the service, for SEO

## Tips for copying

- **Rich text (service content, package description, article body):** open the file in Markdown preview (VS Code: `Ctrl+Shift+V`) and copy from the preview. TipTap keeps the headings, bold and lists when you paste rendered HTML. Raw markdown pastes as plain `##` text.
- **Highlights, inclusions and exclusions:** one bullet per row in the form.
- **Request form:** in the service editor, set **Air Ticketing, Hotel Booking, Visas & Travel Insurance** (#5) to "Flight request form" (it has an optional hotel/Airbnb and travel insurance section; visa needs go in its notes) and **Study Abroad Programmes** (#7) to "Study abroad form". Add the partner institutions under Partner Institutions first, because the study form only appears once at least one is published. All other services use the general inquiry form.
- **Countries for study abroad and international school tours** come from **Partner Institutions** (currently one: University of Leeds, United Kingdom). When you publish an institution in a new country, add that country to #7 and #8 as their header notes describe.
- **Order to create things in:** services first, then packages (tick the service in "Services"), then articles (choose the related service).
- **Prices marked `[confirm]`** are suggestions for packages that are *not* on a flyer. Check them with the business before publishing. Prices without that mark come straight from the flyers.
- Festive packages (Zanzibar, Twende Mombasa, Cape Town, Phuket, Turkey Expo) carry December 2026 dates. Update or unpublish them after the season.

## Services (sortOrder matches the file number)

| # | Service | Package 1 | Package 2 | Article |
|---|---|---|---|---|
| 1 | [Guided Wildlife Safaris](01-guided-wildlife-safaris.md) | Uganda Classic Safari (new) | Best of Tanzania Safari (flyer) | Uganda safari guide: parks and seasons |
| 2 | [Gorilla & Chimpanzee Trekking](02-gorilla-chimpanzee-trekking.md) | Bwindi Gorilla Express (new) | Primates of Uganda (new) | Gorilla trekking: permits, fitness, packing |
| 3 | [Holiday Packages](03-holiday-packages.md) | Twende Mombasa festive trip (flyer) | December Zanzibar Trip (flyer) | Mombasa or Zanzibar for December? |
| 4 | [Custom Luxury Itineraries](04-custom-luxury-itineraries.md) | Best of Turkey Grand Tour (flyer) | Christmas in Cape Town (flyer) | How a tailor-made trip comes together |
| 5 | [Air Ticketing, Hotel Booking, Visas & Travel Insurance](05-flights-hotels-visas-insurance.md) | Mombasa Beach Getaway (flyer), Christmas in Phuket (flyer) | Egypt: Cairo Escape (flyer), Dubai City Break (new) | Cheaper flights out of Entebbe; Visa guide for Ugandan passport holders |
| 6 | [Medical Tourism](06-medical-tourism.md) | Health Check & Specialist Consultation Abroad (new) | Treatment Journey Abroad (new) | Medical treatment abroad: step-by-step guide |
| 7 | [Study Abroad Programmes](07-study-abroad.md) | Undergraduate: Foundation & Bachelor's (new) | Postgraduate: Master's & PhD (new) | Studying abroad from Uganda: choosing a country and applying |
| 8 | [School Tours](08-school-tours.md) | Uganda Educational Field Trip (new) | International Educational & Campus Tour (new) | Planning a school trip, at home or abroad |
| 9 | [Corporate & Business Travel](09-corporate-business-travel.md) | Turkey Expo & Market Trip (flyer) | Jinja Corporate Retreat (new) | Business trips and trade fairs from Uganda |
| 10 | [Airport Transfers & Car Rental](10-airport-transfers-car-rental.md) | Entebbe Airport Transfer (new) | 4x4 Safari Vehicle Hire with Driver (new) | Hiring a safari vehicle in Uganda |

**Flyer packages not used above** (add them later or tag them to a second service):
- **Egypt** is used in #5.
- **Nairobi City Tour**: full day, small group, **USD 96**. Covers Nairobi National Park, the Giraffe Centre, the Sheldrick elephant orphanage and a city skyline tour, and includes hotel pickup and drop-off, a professional guide, lunch and park fees. It fits as a third package under #1, or as an add-on to Mombasa.

## Open questions for the business

1. **"Car Bonding"** is on the services list in the PDF, but the PDF doesn't explain it. Does it mean vehicle import, bond and clearing? Once that's confirmed, it can become its own service.
2. **Best of Turkey Grand Tour**: the flyer says "6 days, 5 nights" but lists "4 nights accommodation 4★". Is one night spent on an overnight transfer?
3. **Best of Tanzania**: the flyer has no price or duration. The 8-day version and its price here are suggestions.
4. **Awards**: the flyers say "Multiple award winning tour operator". Name the awards if possible, because named awards build more trust.
5. **Hospital partners**: the flyers name **JD Max Health Care India**. Apollo appears only in the artwork, so these files don't claim it as a partner. Add other hospitals only once there is a written agreement.
6. **Permit prices** (UWA gorilla and chimp permits) change. Check the current rate before publishing.

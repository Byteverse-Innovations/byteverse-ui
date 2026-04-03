# Real estate site delivery checklist — React / Next.js

App Router–friendly parallel checklist. Assumes **IDX via an approved vendor** (embed/widget/deep links), not a custom MLS backend.

## Discovery & access

- [ ] Confirm IDX vendor, tier, MLS display rules, REO filter feasibility
- [ ] Decide **content editing model**: headless CMS vs MDX vs “you maintain copy”
- [ ] Domain/hosting (Vercel/Netlify/etc.) + env vars + preview deployments

## Core build

- [ ] Next.js project setup: routing, layouts, shared components
- [ ] Design system: typography, spacing, components (hero/slideshow, cards, carousel, CTAs)
- [ ] Homepage parity: slideshow, featured listings (**vendor widget/embed**), quick search (**vendor widget or deep link UI**), testimonials, CTAs
- [ ] Dedicated `/search` (or vendor route) strategy: embed vs iframe vs external deep link—**confirm UX + mobile**
- [ ] 5 regional landing pages + local content blocks + IDX embed/deep links
- [ ] SVG/interactive map component: 5 hit regions → stable filtered URLs (**test on mobile tap targets**)
- [ ] Buyers + Sellers pages + forms
- [ ] Market data page: agreed approach (static monthly, PDF, embed, curated stats—**no scope creep**)
- [ ] Specialty pages + forms; REO search link/filter UX as permitted
- [ ] About, testimonials, contact (tel/mailto/social + form)

## Integrations (no “plugin store”)

- [ ] IDX: install snippets, domain allowlisting, cookie/consent notes if using tracking-heavy embeds
- [ ] Forms provider/API + server actions/route handlers + spam protection (honeypot/Turnstile/reCAPTCHA)
- [ ] Email notifications + optional CRM webhook
- [ ] Mortgage calculator: chosen library/widget + legal disclaimers adjacent to results

## SEO (Rank Math equivalent)

- [ ] `metadata` API per route + canonical URLs
- [ ] `sitemap.xml` + `robots.txt`
- [ ] OpenGraph/Twitter cards + default share image
- [ ] JSON-LD for **Organization/Person/LocalBusiness** as appropriate (keep accurate)
- [ ] Clean title/description patterns for programmatic pages (if any)

## Performance & QA

- [ ] Image pipeline (Next/Image), carousel performance, avoid layout shift on embeds
- [ ] Mobile testing: **iPhone/Android** for embeds/maps/forms (biggest risk area)
- [ ] Accessibility pass on forms, map, carousel controls

## Launch

- [ ] Production env, analytics, error monitoring (optional but high ROI)
- [ ] Search Console + sitemap submit
- [ ] GBP instructions + verify site linkage (**client-driven verification**)
- [ ] Redirects + DNS
- [ ] Handoff: how to edit content (CMS) **or** update cadence if no CMS

## Launch Package (client-facing sub-lines)

Use under the main **Launch Package** line item on quotes; maps to the checklist above without overwhelming scope.

**Launch Package** — Next.js real estate site (one IDX provider; embed/widget/deep links)

1. **Setup & IDX** — Next.js project + hosting/preview environments; confirm IDX vendor, tier, and what’s allowed (search, featured, alerts, REO filter if included); **content editing approach** agreed (CMS, MDX, or maintained by us); domain/DNS, SSL.
2. **Design system** — Shared components, typography, brand (fonts/colors/logo), responsive layouts for key routes.
3. **Homepage** — Hero slideshow (client photography), featured listings from IDX, quick search, testimonial carousel, clear CTAs.
4. **Search & regions** — Full IDX search experience (map/list or vendor route per plan); five community pages with local content and IDX links; interactive Florida map with five regions to those searches.
5. **Buyer & seller tools** — Buyers page + lead capture and IDX flows as supported; sellers page + home value/CMA landing + forms; embedded mortgage calculator (no off-site redirect for the tool).
6. **Specialty & market** — Market data page (format agreed in kickoff); pre-foreclosure, short sale, and REO-focused search **subject to MLS/IDX rules**.
7. **Trust & contact** — About/bio, testimonials (page + homepage), contact with call, email, social, and form.
8. **SEO, QA & launch** — Metadata, sitemap, robots, Open Graph, and structured data as scoped; forms + spam protection, GA4 + form events; image/performance pass and iPhone/Android check on search, forms, embeds; production deploy, Search Console + sitemap, GBP setup guidance (client finishes verification), handoff and short training (including CMS workflow if applicable).

*IDX subscription, domain purchase, and verified Google Business Profile are client responsibilities; we configure and guide.*

## Timeline

**Target completion / go-live:** **June 30, 2026** (Tuesday)

Adjust milestone dates if kickoff, IDX access, photography, copy, or CMS decisions arrive late.

| Target date | Event |
|-------------|--------|
| **April 11, 2026** | Kickoff; IDX vendor + tier confirmed; MLS/display assumptions documented; content model chosen (CMS / MDX / other); repo, hosting, preview deploys; domain/DNS plan |
| **April 25, 2026** | Design system on preview/staging (brand, layouts); homepage draft (hero slideshow, featured IDX, quick search, testimonials, CTAs); IDX search route/embed strategy live |
| **May 16, 2026** | Five community pages + Florida map → filtered searches; buyer & seller tools + forms + calculator; specialty & market pages; about, testimonials, contact |
| **June 6, 2026** | SEO surfaces (metadata, sitemap, robots, OG/JSON-LD as scoped); forms + GA4/events; image/performance pass; QA (incl. iPhone/Android); **client review** + one consolidated revision round |
| **June 23, 2026** | Production deploy prep; Search Console + sitemap; redirects if replacing an old site; final smoke test on production URL |
| **June 30, 2026** | **Launch** — production live; GBP setup guidance delivered (client completes verification); handoff + training (editing workflow per agreed content model); post-launch support window starts |

## Quick positioning

**Next.js:** strong path to **cohesive custom UI and performance control**; you explicitly solve **CMS + forms + SEO primitives** (standard practice).

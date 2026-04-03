# Real estate broker + agent sites — delivery checklist

Checklist for a **broker-hosted** web program: a **main broker site** plus **per-agent subsites**, where **each agent’s domain is registered in the agent’s name** (or their LLC), while **hosting, stack, and day-to-day ops** sit with the broker (or the broker’s agency). The broker **charges agents** (setup + recurring) for sites, support, and bundled services.

Assumes **IDX via an approved vendor** (embed/widget/deep links) unless the broker has a single enterprise agreement that covers all agent displays—**confirm with IDX vendor + MLS rules** before promising parity across subsites.

---

## Discovery & commercial model

- [ ] **Roles & money** — What is included in the agent fee (hosting only vs design updates vs IDX seat vs CRM)? Setup fee vs monthly? Minimum term / cancellation?
- [ ] **Quote & proposal** — Use the **client quote** (summary, line items, **Monthly costs** tab in the admin quote editor) for pricing—no separate static template in this doc. For the main build line, use the catalog **Scale Package** and **sub-lines** written so a non-technical reader can follow; see **Quote alignment** below.
- [ ] **Who pays IDX** — For this program the **broker already pays for IDX**; the quote covers **integration work** (sites + vendor rules), not selling a new IDX subscription. Capture any seat limits or agent-billed exceptions in the SOW.
- [ ] **MLS / board rules** — Whether agent-branded sites must show specific disclaimers, broker branding, or office info; whether **each site** must map to a licensed agent/office ID in the IDX feed.
- [ ] **Domain ownership** — Confirm in writing: **agent (or entity) owns registrar account**; broker receives **DNS access** (or clear steps) to point domains to broker infrastructure.
- [ ] **Content & compliance** — Who approves copy on agent sites; fair housing / advertising rules; optional broker “style guide” or required footer/disclaimer blocks.
- [ ] **SEO scope & ownership** — What’s included: **technical SEO baseline** (metas, sitemaps, GSC setup) vs **ongoing SEO** (content, links, reporting)? Who verifies **Search Console** per agent domain (agent vs broker)? Any **managed local SEO** (GBP, citations) as a paid add-on?
- [ ] **Stack decision** — e.g. **WordPress Multisite** (one codebase, mapped domains), **separate WordPress per agent** (more isolation, more ops), or **monorepo / multi-tenant app** (e.g. Next.js + CMS)—pick before build.
- [ ] Staging strategy: broker hub on staging; **one pilot agent** domain on staging (subdomain or hosts file) before broad rollout.

---

## Technical — broker hub (main site)

- [ ] Broker brand site: same functional areas as a standard brokerage site (IDX, areas served, recruiting, contact, compliance text as required).
- [ ] Clear **“Our agents”** or roster with links to each agent’s **canonical public URL** (their own domain).
- [ ] **SEO (hub)** — Unique title/description templates for key pages; `sitemap.xml` + `robots.txt` for **broker hostname only**; Open Graph / Twitter defaults; JSON-LD **Organization** (and **WebSite** + `SearchAction` if you expose site search) accurate to the **brokerage**; internal links to priority agent sites where it helps users (avoid generic “link to everyone” footer spam).
- [ ] Optional: internal-only directory or SSO **not in scope** unless specified.

---

## Technical — agent subsites (multi-tenant)

- [ ] **Tenant model** — One install with domain mapping vs isolated installs; document tradeoffs (updates, blast radius, plugin policy).
- [ ] **Custom domain flow** for each agent:
  - [ ] Agent registers domain (registrar of their choice) **or** broker assists but **registrant = agent**.
  - [ ] DNS: **A/CNAME** (and **www**) to broker’s host; **no registrar login** required for broker if using CNAME to platform.
  - [ ] **SSL** — Automated certs per hostname (e.g. Let’s Encrypt); renewal monitoring; fix mixed content if IDX/widgets use HTTP.
- [ ] **Domain allowlists** — IDX vendor + forms + analytics: add **every agent hostname** (and staging hostnames) where vendors require it.
- [ ] **Isolation** — Per-site admins (agent editor only on their site); broker **super-admin**; backups **per site** or per network as designed.
- [ ] **Email** — Clarify: site contact forms go where? Broker CRM vs agent inbox? SPF/DKIM if sending from broker domain.
- [ ] **Template vs customization** — Shared theme/templates with per-site: logo, headshot, bio, colors (within limits), optional extra pages.
- [ ] **SEO (tenancy)** — Each hostname emits its own **canonical** URLs (no accidental cross-site canonicals); staging/preview URLs **noindex** or auth-gated; shared templates don’t produce **duplicate** default titles across all agents (per-site placeholders + editor guidance).

---

## Core build (per agent site — template)

Reuse the same **page types** as the single-site checklist (home, search, buyers/sellers, about, contact, etc.) **as sold**, with scope controlled by tier.

- [ ] Mobile-first templates aligned with broker-approved template set.
- [ ] Homepage: hero, featured IDX (as tier allows), search entry, testimonials/CTAs.
- [ ] Full IDX search experience per vendor setup; **test on agent domain**, not only broker domain.
- [ ] Regional/community pages **only if included** in agent package (avoid scope creep).
- [ ] Lead capture + routing (per agent); spam protection.
- [ ] About/bio, contact (click-to-call, email, social, form), optional GBP link guidance (**agent completes** verification on **their** business profile if applicable).
- [ ] **SEO-friendly content structure** — Sensible `h1`/`h2` hierarchy per page; agent-specific **meta title/description** defaults (city + name + role); real **alt text** for headshots and hero imagery (not empty or “image1”); avoid identical long **boilerplate** blocks on every agent site if it dilutes differentiation (broker-approved variance or localized copy where scoped).

---

## SEO integration (broker + every agent hostname)

Technical and **per-domain** SEO so broker and agent sites can rank and share cleanly—without treating IDX inventory as a substitute for unique local content.

- [ ] **Per-hostname baseline** — Default title/description patterns; canonical tags; **one `h1`** per page; pagination/tag archives handled (noindex thin archives if needed).
- [ ] **Sitemaps & discovery** — XML sitemap **per live domain** (broker + each agent); submit in **Google Search Console** (and **Bing Webmaster** if agreed); keep sitemap URLs **HTTPS** and consistent with canonicals.
- [ ] **Structured data** — Valid JSON-LD appropriate to each site: e.g. **`RealEstateAgent`** (and related **`Person`** / **`LocalBusiness`** fields where accurate) on agent sites; **`Organization`** / **`LocalBusiness`** on broker site; **do not** claim multiple conflicting `@id` graphs across hub + agent sites for the same entity.
- [ ] **Social & sharing** — Open Graph + Twitter card defaults per site; **og:url** matches canonical; share image strategy (per-agent headshot/hero vs broker fallback—define in template).
- [ ] **Internal linking** — Broker roster → agent **money pages** (home + primary service pages); optional agent → broker **disclosure/office** page; avoid manipulative reciprocal footers.
- [ ] **IDX & search** — Understand vendor behavior: iframe/embed vs native URLs; **thin or duplicate** listing pages—use vendor guidance on indexing; noindex param-heavy URLs if they create crawl noise; **test** `robots`/meta on search result templates.
- [ ] **Redirects & migrations** — If an agent **replaces an old site**, redirect map (301s), GSC “change of address” **only when applicable**, update **GBP** website URL; preserve equity where scoped.
- [ ] **NAP & local consistency** — Align **name, office, license** text with MLS/board rules and GBP (where agent manages GBP); broker template includes required legal lines without breaking structured data honesty.
- [ ] **Reporting** — If SEO is in the fee: quarterly or monthly **GSC** export + agreed KPIs (impressions, branded queries, key landing pages)—define in SOW.

---

## Plugins, IDX, and “one network” hygiene (WordPress-oriented)

If using **WordPress / Multisite**, keep the plugin set **tight** and **network-approved** so one bad plugin does not take down all agents.

- [ ] Network-wide: updates policy, staging for plugin changes, who approves new plugins.
- [ ] IDX: per-site configuration where needed (agent identity, office keys—per vendor docs).
- [ ] Forms + CRM routing documented per tenant.
- [ ] **SEO plugin (network-wide)** — e.g. Rank Math / Yoast: **network or per-site** policy; breadcrumbs if theme supports; **no** auto-generated thin archives indexed by mistake; aligns with **SEO integration** section above.
- [ ] Analytics: GA4 **per agent property** vs roll-up under broker—privacy policy and consent as required.

---

## Performance & QA

- [ ] Spot-check Core Web Vitals on **broker site + 2–3 agent domains** (mobile).
- [ ] Cross-browser + **iPhone/Android** on search, forms, maps/embeds **on an agent custom domain**.
- [ ] **SEO QA** — Spot-check **Rich Results Test** / schema on broker + one agent site; **URL Inspection** or live test for canonical + indexability on key templates; no mixed content; `robots.txt` doesn’t block CSS/JS needed for rendering; Lighthouse **SEO** category on homepage + one interior page per hostname sample.
- [ ] SSL expiry / auto-renewal alerts; broken IDX after domain add = retest allowlists.

---

## Launch & ongoing

- [ ] **Onboarding packet for agents**: domain DNS steps screenshot/video, what they must buy, timeline, support channel.
- [ ] **Runbook**: add new agent site (provision → map domain → SSL → IDX allowlist → **sitemap + GSC property** (or handoff steps) → smoke test → handoff).
- [ ] Production cutover checklist for each domain (no stray staging links).
- [ ] **Billing alignment** — Invoice/cycle start tied to go-live or DNS live date (define in contract); pricing and recurring fees reflected in the **signed quote** where applicable.
- [ ] Handoff: editor training **per tier**; escalation path when an agent wants custom dev outside plan.

---

## Quote alignment — Scale Package (broker + agent network)

**Source of truth (Notion):** In the **Business Model** database, the row **Scale Package** defines the product. Use these fields on quotes and marketing so they stay in sync with Notion:

| Notion field | Value |
|--------------|--------|
| **Item** | Scale Package |
| **Category** | Packages |
| **Pricing model** | Package |
| **Price range** | **$5,000+** |
| **Show on main site** | Yes |
| **Description** | End-to-end infrastructure and engineering support to scale your systems as you grow. Includes cloud setup, security baseline, and deployment best practices. |

*(Notion page body may be empty—treat **Description** and **Price range** as the canonical text for the package line.)*

In the admin quote editor, pick **Scale Package** as the **parent** line and paste or paraphrase the **Description** above into the package line so clients see the official scope. **Broker + agent programs** still need the sub-lines below so the PDF/portal spells out sites, listings, leads, and domains—those are how the generic “scale your systems” + cloud/security/deployment story shows up for real estate.

Add **sub-lines** under that parent so the PDF and client portal read like a clear scope list. **Write titles and descriptions in plain language**—short sentences, no jargon unless you define it. Use the wording below as a starting point; adjust names to match how you talk to brokers.

### Quote line items & sub-lines to add

Use **one parent line** for the package (this row holds **qty × rate** and the total for the build). Add **nine sub-lines** nested under it—each sub-line is **descriptive only** (detail for the client PDF/portal; in the editor they carry **no extra charge** vs the parent package).

#### Parent line (priced)

| | |
|---|---|
| **Title** | `Scale Package` |
| **Description** | `End-to-end infrastructure and engineering support to scale your systems as you grow. Includes cloud setup, security baseline, and deployment best practices.` |
| **Price** | Enter your sold amount (Notion **Price range** is **$5,000+**; raise for larger networks, heavier listings integration, or longer timelines). |
| **Catalog link** | Choose the **Scale Package** service on the line when you pick from the catalog so proposals stay aligned with Notion. |

#### Sub-lines (nine — nest under `Scale Package`)

Use these **titles** and **description** fields verbatim or trimmed; keep one sub-line per row.

1. **Title:** `Program overview & pricing story`  
   **Description:** What we’re delivering in plain terms; what’s covered by ongoing monthly fees vs billed separately; how many agent sites are included in phase one; key rules from your listings vendor and the MLS. The quote **Summary**, this table, and **Monthly costs** spell out pricing.

2. **Title:** `Main broker website`  
   **Description:** Public brokerage site: branding, listings search entry points, recruiting, contact, and required legal or board copy. Directory of agents linking to each agent’s live site on their own domain.

3. **Title:** `Agent website template`  
   **Description:** Shared design with per-agent branding (logo, photo, bio, colors within guidelines). Core pages: home, search entry, buyers/sellers as sold, about, contact, and required disclaimers.

4. **Title:** `IDX integration (broker-paid subscription)`  
   **Description:** The **broker already pays for the IDX vendor**—this line is **implementation**, not a new IDX subscription. We connect your existing feed to the broker site and each agent site: search and listing experiences per vendor and MLS rules, required disclaimers and office/agent identity, domain allowlisting, and testing on every live hostname. Ongoing vendor fees stay in **Monthly costs** or your existing broker agreement; they are **not** passed through as a new IDX line item on this build unless you explicitly add a pass-through.

5. **Title:** `Search visibility (Google & Bing)`  
   **Description:** Each domain set up for search: page titles and descriptions, site map file, accurate business info in results. Brokerage on the hub site; each agent on their own site. Google Search Console (and Bing if agreed) per live domain. Hub links to key agent pages. If replacing an old site, redirect plan when in scope.

6. **Title:** `Contact forms & where leads go`  
   **Description:** Contact forms with spam protection. Agreed routing to broker CRM, agent email, or both. Optional: showing requests, calendars, or scheduling tools only if included in this sale.

7. **Title:** `Optional specialty pages`  
   **Description:** Extra pages beyond the core IDX experience—e.g. neighborhood guides, calculators, or campaign landings—**only if included** in this sale.

8. **Title:** `Domains, security & access`  
   **Description:** Custom domains; HTTPS on every site; consistent www vs non-www; agents edit only their site, you retain admin; backups; IDX/vendor allowlists updated as new domains go live.

9. **Title:** `Analytics, training & launch support`  
   **Description:** Traffic tracking (per-agent or combined—per what you sold), key conversions (e.g. form submits), privacy/cookie text as needed. Written onboarding for new agents; internal steps to add a site safely; cross-device testing; agreed go-live support window.

**Also add (outside the line-items table):** optional **Client-facing summary** at the top of the quote; **Monthly costs** tab for ongoing hosting, **IDX vendor fees** (broker-paid), and other pass-throughs.

---

### Pillar A — The websites (broker + every agent)

*Ties to “scale your systems” and **deployment** work: the public broker site plus every agent site, each on its own address.*

1. **Program overview & pricing story** — What you’re delivering in plain English: what’s included in the monthly fee vs billed separately, how many agent sites are in the first phase, and any rules from the listing feed vendor or the MLS. Point them to the **Summary** at the top of the quote, the line items for build cost, and the **Monthly costs** section for ongoing fees.
2. **Main broker website** — The brokerage’s public site: brand, listings search entry points, recruiting, contact, and any required legal or board wording. Include a directory of agents with links to each agent’s **real website address** (their own domain).
3. **Agent website template** — A consistent look across agents with room for each person’s logo, photo, bio, and colors within your guidelines. Core pages such as home, search, buyers and sellers, about, and contact, plus any required disclaimers.
4. **IDX integration (broker-paid subscription)** — The broker **already pays for IDX**; this scope is **implementation**, not selling a new vendor contract. Implement the feed on the hub and each agent site per vendor + MLS rules (search/detail UX, disclaimers, office/agent IDs, allowlists, testing per domain). Keep recurring IDX vendor costs in **Monthly costs** or document them against the broker’s existing agreement—not as a hidden add-on on the Scale Package line unless you intentionally pass something through.

5. **Search visibility (Google & Bing)** — Each site is set up so Google can understand it: page titles and descriptions, a site map file, and honest business information in search results. Broker site shows the brokerage; each agent site shows that agent. Connect each live domain to **Google Search Console** (and Bing if you agreed). Link the broker’s agent list to important agent pages. If an agent is replacing an old site, include a plan to forward old links to the new site **when that’s in scope**.

### Pillar B — Leads & appointments

*Ties to **engineering support** for the business: reliable capture and routing of inquiries and, if sold, showings or appointments.*

6. **Contact forms & where leads go** — Contact forms with spam protection. Clear agreement on whether leads go to the broker’s CRM, the agent’s email, or both. Optional: requests for showings, embedded calendars, or a scheduling tool **if you included that in the sale**.
7. **Optional specialty pages** — Extra pages beyond core IDX (neighborhood guides, calculators, campaign landings) **only if included**.

### Pillar C — Hosting & handoff

*Ties directly to Notion’s **cloud setup**, **security baseline**, and **deployment best practices**: domains, HTTPS, access, backups, analytics, and how you onboard new sites safely.*

8. **Domains, security & access** — Help each site use its own web address; secure **HTTPS** on every site; clear **www** vs non-www behavior; each agent can edit only their site while you retain admin access; backups; and IDX/vendor **allowlists** updated as new sites go live.
9. **Analytics, training & launch support** — Website traffic tracking (one property per agent or a combined view—whatever you sold), key actions counted (such as form submits), and privacy/cookie wording as needed. Written steps for new agents (DNS, what they buy, who to call). Your internal checklist to add a site safely. Final testing across phones and computers, and an agreed window of support around go-live.

*Fees paid directly by agents—such as domain registration or verifying their own Google Business Profile—stay out of this build line unless your contract says otherwise; **IDX subscription is broker-funded** for this plan, so do not imply agents are buying the feed unless you have a different commercial model—mention exceptions in the quote notes when relevant.*

---

## Timeline (template)

The **Scale Package** row in Notion does not set a fixed **Estimated duration**—set the schedule in the quote. Use this table as a planning template; stretch for pilot scope, wave rollout, and IDX vendor lead time.

| Target | Event |
|--------|--------|
| **Week 0–1** | Kickoff; stack locked; IDX + MLS assumptions; broker hub IA; commercial/onboarding doc draft |
| **Week 2–4** | Broker hub build on staging; multisite/network baseline; first **pilot** agent site + test subdomain |
| **Week 4–6** | Pilot agent **custom domain** live; SSL + IDX allowlist proof; template hardening; **SEO baseline** (sitemap, GSC, schema sample); onboarding doc finalized — *often where core delivery for the first wave lands* |
| **Week 6+** | Roll out remaining agents in **waves**; per-domain checklist (incl. SEO + analytics); optional SEO reporting cadence starts per SOW |

---

## Quick positioning

**Broker-hosted + agent domains** scales like a **small SaaS**: clear runbooks and careful domain/security habits matter more than a single brochure site. Quote it under **Scale Package** with plain-language sub-lines for the three pillars (websites—including **IDX integration** on the broker’s existing subscription—leads/appointments, hosting & handoff), then use **Monthly costs** for hosting and **IDX vendor fees** the broker already carries. **WordPress Multisite** is a common fit for **editor-friendly** agent sites with **mapped domains**; separate installs add isolation at the cost of maintenance. Align **IDX licensing** and **MLS display rules** early—those constraints drive whether every agent site can look “fully IDX-capable” or must use deep links/widgets only. **SEO** must be **per hostname** (canonicals, sitemaps, GSC, schema); shared templates need guardrails so every agent site doesn’t ship with **duplicate titles** and **thin identical** copy—decide what’s baseline vs a higher **SEO tier** in the agent fee.

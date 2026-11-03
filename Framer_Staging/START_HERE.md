# Quadra website — Framer staging content handoff

**2 November 2026 · content master v0.5 · prepared, not imported**

## Recommendation

Start a protected Framer staging implementation now while practice review continues. Use one content master and a controlled review loop, not a separate staging copy that gradually diverges. This package is a content handoff with a proposed field mapping. It is **not a complete Framer project, a deployed staging website or an export verified against your current collections**.

## What is ready

- `cms/Pages.csv`: standard review-copy page records with a stable page key, heading, introduction, conservative HTML body and SEO text. This is the primary candidate import.
- `pilot/Pages_Pilot.csv`: a small representative subset for testing before bulk import.
- `modules/`: optional section, card and action data for mapping to real components. These files are builder data, not automatically connected relational collections.
- `static/Static_Page_Modules.json`: approved homepage and Happy Customers framing. Preserve existing case data and template bindings; no customer case records are exported.
- `mapping/`: proposed field definitions, navigation, relationships, route candidates, link gaps and image-placeholder requirements.
- `seo/`: metadata and schema binding plan, not production-ready schema code.
- `review/`: material deliberately kept outside public copy, including exclusions and the recognition publication condition.
- `plain_copy/`: readable content fallback if rich-text CSV import does not preserve formatting. Markdown is for manual content review/paste, not evidence that native CSV parses Markdown.

The review pack remains the authoritative source package. Change its `content.json`, then regenerate preview and staging export. Do not author competing content in CSV and the master.

## Before the first import — web owner

Provide the actual Framer project/staging link, collection field inventory or a representative sample export, and the page/component inventory. Confirm collection ownership, content/design/deploy permissions and plan capacity. A project URL alone may not expose the schema.

Use a duplicate project for the first import, or a genuinely isolated unbound collection and template. Record the current production version and a recoverable baseline. Do not import into or overwrite the Happy Customers collection. Do not assume a new collection named “Staging” is private or unpublished.

### Proposed page collection

Use a new name such as **Quadra Review Pages — Nov 2026** if an existing collection might be confused with it. The proposed template path is `/review/:slug`, not a production URL decision.

`Name`, `PageKey`, `Heading`, `Subheading`, `Lead`, `Introduction`, `Eyebrow`, `PageType`, `SEOTitle`, `SEODescription`, `CTA` and `CTATargetKey` are suggested text fields. Bind `Slug` to the actual item slug. Map `Content` to a formatted-text field **only after the pilot confirms native import preserves the HTML**. `PageKey` is editorial identity, not an assumed Framer update key. The page template supplies the single H1; the body begins with section headings.

The detailed mapping is in `mapping/Field_Map.json`. No custom field is treated as a platform draft/publish control.

## Pilot acceptance — then bulk import

1. Verify the destination project, collection and template before importing the pilot. Map fields explicitly.
2. Inspect CMS values and rendered pages: headings, paragraphs, lists, punctuation, commas, line breaks, cards represented as text, and the intended page/section hierarchy.
3. Confirm that HTML is rendered as formatted copy, not literal tags. If it is not, stop the bulk import and adjust through the project’s supported import/API or copy-paste workflow.
4. Validate every link. `/review/…` routes work only after the builder creates that template and imports their destinations. Blank mapped targets and non-clickable CTAs are intentional pending staging wiring; never silently point a test form or booking flow at production.
5. Use a temporary pilot item to test duplicate slug, re-import, empty-cell and omitted-field behavior. Do not assume update-versus-skip behavior or safe idempotence from a file name.
6. Bind SEO fields in actual page settings and verify the resulting metadata. A CSV title field alone does not configure SEO.
7. Check desktop and mobile layout, focus order, keyboard navigation and one-H1 hierarchy. The supplied HTML preview is a content review reference, not the Framer layout.
8. Record the exact pilot result and only then import the remaining eligible rows. Stop on unexpected conflicts. Use the same approved field mapping and inspect the completed set.

References, multi-references, images and enum/boolean encodings are not guessed. The optional normalized files use plain editorial keys; bind them only after the real project representation is known. Images remain placeholders, as requested.

## Protected staging, not premature publication

- Confirm access control and noindex on the actual review URL. Noindex is not confidentiality. A reachable preview URL is not automatically private.
- Confirm staging and production separation before publishing anything. If staging is unavailable or cannot be separated safely, use the duplicate project and do not connect the production domain.
- Keep submissions disabled or route to an approved sandbox. Verify CRM/email automation, analytics and consent behavior; a staging URL alone does not prevent real side effects.
- Keep The Compass non-operational until its website-only source corpus, source links, no-answer behavior, privacy safeguards and approved-page index have been tested. No internal notes, customer secrets or held claims belong in its index.
- Keep excluded routes out of active navigation until ready. Link mappings and excluded records are explicit in the package; do not create public placeholder pages for completeness.
- The homepage recognition module is excluded from the default static handoff. Use the gated planned copy only after the announcement condition is cleared; the original master remains unchanged for review.

## SEO and AI-discovery implementation

Use stable approved URLs; changed navigation labels do not justify new slugs. Resolve canonical and redirect decisions against the current site before production. Do not point protected review copies at newly invented production URLs or deploy a staging sitemap for indexing.

Every page must answer: who it is for; the business problem; the outcome sought; Quadra’s concrete contribution; scope/dependencies; evidence that can be followed; and a next step. Use useful descriptive headings, natural terminology and connected practice/outcome links. Do not invent FAQs, reviews, ratings, guarantees or unsupported structured-data claims merely to increase search visibility.

Map visible content to truthful page/service schema only where appropriate. Bind social titles/descriptions and approved OG assets; validate internal links, crawlable pagination/filter behavior, accessibility, mobile performance and consent-aware analytics. Existing cases retain their canonical identity and their original approved wording.

## Production release — separate approval

Production requires content approval, closed material claim/scope questions, rights and evidence checks, verified forms/Compass behavior, SEO/canonical/redirect validation, accessibility and performance checks, and a tested rollback. Review-only noindex settings must not accidentally ship to indexable production pages. Deploy the specifically tested version through an authorized owner; this handoff grants no production approval.

## Official source notes

See `Framer_Sources.json` for retrieved official guidance. Framer supports CSV content import and a first-party import plugin; neither the retrieved CSV guidance nor API documentation establishes every native cell encoding used by your project. The proposed import contract is deliberately pilot-gated. API HTML/Markdown and reference rules are not represented as native CSV rules.

## Items needed from Quadra

- **Web owner:** real schema and component inventory; staged access; deploy owner and rollback baseline.
- **Practice owners:** responses to the separate practice clarification register—especially supported scope, commercial readiness, service commitments and proof permission. Resolve those without reopening approved navigation or the settled AIG D-01–D-06 decisions.
- **EAICG:** refreshed scope and content input. Its absence must not be filled by inventing a new public practice or delivery claim.

No production site, customer case collection, source submission or live Framer project was changed by preparing this package.

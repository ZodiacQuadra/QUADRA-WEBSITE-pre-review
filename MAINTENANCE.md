# Quadra website content-review mockup

## Purpose
A simple internal review of copy, hierarchy and cross-links before the Framer build. No animations, fetched assets, stock imagery, working forms or live AI service. Image regions are labelled placeholders. This is not the production website and is marked noindex.

Open `Quadra_Website_Review.html` in a modern browser. Use the expandable header menus, page index and contextual links to move between page views. Each view has a stable local anchor, so a review can refer to the exact page without changing a production URL. Browser Back/Forward works with this local navigation. Menus close on link selection, outside click, Escape and keyboard focus leaving the menu; only one menu can be open. A minimal inline script provides these navigation behaviors without network or storage access.

The Compass, newsletter/contact forms, and case filters/search are layout previews only. They do not send, save or retrieve data. Case-study links marked with an external arrow open the existing public page. The Happy Customers sample is not a complete export of the library; case records are unchanged.

## Files and responsibilities
- `content.json`: maintained page/section copy, SEO candidates, related-page references and source traceability. One source of copy; do not create a second independently edited set of pages.
- `navigation.json`: header groups, six-block practice menu and local destinations.
- `menu.js`: local menu-dismissal and keyboard behavior, embedded into the self-contained HTML.
- `browser_qa.json`: actual browser interaction test results.
- `render_mockup.py`: deterministic rendering of content into the self-contained review file. Requires Python and BeautifulSoup; no network calls.
- `seed.html`: base scaffold for the renderer.
- `manifest.json`: review version and functional boundaries.
- `REVIEW_NOTES.md`: editorial changes and owner decisions, separate from the customer-facing copy.
- `external_validation.json` / `external_validation.md`: evidence and qualifications from public sources; not approval of Quadra-specific claims.
- `source_manifest.json`: submission names, source versions and extraction fingerprints. Original OneDrive files remain unchanged and are referenced by the project.
- `SEO_AND_AI_DISCOVERY.md`: per-page production requirements retained during review; not deployed configuration.

## Making the next revision
1. Identify the source file and modification date; read its contents rather than assume a newer timestamp means changed wording.
2. Compare the affected page IDs and review the claim/evidence records. Preserve the CSG/non-Microsoft and ISPG/Microsoft Security boundary.
3. Edit the relevant strings in `content.json`; keep page and section IDs stable. Update page SEO candidates and related links from the same approved meanings.
4. Keep uncertain company claims out of clean copy or qualify them. Record the decision in `REVIEW_NOTES.md`; do not insert internal caveats into final marketing copy.
5. Run `python render_mockup.py` from the package directory. Validate local links and read every changed view at desktop and mobile widths before sharing the revised version.
6. Update the version/date in `manifest.json` and retain a brief change log. Replace the maintained review HTML deliberately rather than creating competing 'final' files.

This is a review-stage content model, not a Framer import schema. Once the content is approved, map the same page/section data to the real Framer components, collections, field types and existing URLs. Do not assume CSV can recreate static layouts or interaction behaviour.

## Release boundaries
No production redirects, case-study changes, partner-tier announcements or award announcements are authorised by this mockup. The planned recognition line remains subject to its public-announcement gate. A preserved source name or an OEM-confirmed feature does not validate Quadra's own service availability, SLA, delivery evidence, certifications or customer permissions.

## Latest review v0.3 — AIG change request
AIG_CHANGE_REVIEW.json maps CR-01 through CR-13 to applied status. The user has closed D-01 to D-06; these references are not pending approvals. Existing subpages stay and no absent closing line is invented. The revised AIR and IntelliGuard definitions are supplied review copy, not independent product validation. aig_update_qa.json verifies scope and preservation. content.json is authoritative; core_pages.json is an older snapshot, not a second editable master.

## Latest iteration v0.4
content.json and the rendered preview now include the supplied AWS v1.2 content. PRACTICE_STATUS.json tracks the remaining groups; NOV01_CHANGELOG.md explains this iteration. GCP was rechecked as the same source. Use this maintained ZIP rather than older unpacked copies; edit the master, then regenerate the preview. No final Framer export has started.

The navigation renderer and preview use the same master revision. Keep PRACTICE_STATUS.json updated as submissions move through review and approval; a review-ready status is not production approval. The original uploads and their fingerprints remain immutable.

## Current review v0.5 — staging preparation
HCDW now has substantive copy and source coverage. The related staging export is a derivative of content.json, not a second authoring master. Edit this master and regenerate both preview and staging data together. Keep unresolved private notes and claim evidence out of public CMS fields. Import only into a safe staging collection/project after confirming actual field types; do not overwrite the current case-study library.

# Practice clarification notes — decisions that need human evidence

**Read-only editorial review | 2 November 2026 | master v0.4, 1 November**

This is a targeted intervention list, not a phrase-by-phrase audit or a request to rewrite practice submissions. **21 questions: 2 per group, except HCDW, AWS and the central owner, which have 3.** Nothing has been sent. The master, source documents and Happy Customers records are unchanged.

## How to respond

Reply against only your IDs using: **decision / correct wording / evidence URL / accountable owner or role / approval date**. A short service-scope, component-readiness or evidence table is enough. Give a date and owner where evidence is not yet available. No credentials or passwords in responses; Framer access should use the normal project invitation process.

- **staging_blocker:** prevents a *tested project-specific import or integration*, not content drafting.
- **publication_gate:** the affected assertion, offer or live route needs evidence/approval before publication; other copy can progress.
- **can_progress:** proceed with the stated conservative handling; a richer package can follow.

## Fixed framework — do not reopen

- **Architecting Ambition → Building Intelligent Enterprises → Cloud. AI. Security. One Architect.** Retain the distinct brand roles, a strong non-hyped voice, and the balance of growth, operation and trust.
- Keep four customer entry routes: **Modernize Your Foundation; Transform with AI & Data; Secure Your Enterprise; Empower Your Workforce.** CoE floors are not new routes. Vendor names belong on relevant deeper pages, not the homepage.
- Use seven object types consistently: **practice / capability / commercial offer / IP / delivery model / proof / experience venue.** A practice is specialist expertise; a capability is work it can do; an offer is a bounded engagement; IP is a substantiated reusable asset; a delivery model explains how work is performed; proof evidences a claim; an experience venue enables exploration. Relationships can cross types; a shared name does not make all its components identical. Do not relabel already-approved AIG definitions.
- **CSG remains non-Microsoft; Microsoft Security remains ISPG.** HCDW's AD/Entra backup and recovery scope does not transfer identity/security ownership. AIG remains cross-hyperscaler, including independent frontier labs.
- **AIG D-01–D-06 are closed**, including the supplied BluForge IntelliGuard definition and **AIR as the innovation/validation engine**. Ask about present readiness, evidence and ownership of delivery—not whether the approved definitions should be reversed.
- Preserve Happy Customers records and naming. Approval of copy is not proof of a result, certification, programme status, delivery promise or publication permission.

## Source-state reconciliation

Reviewed **content.json v0.4**, **editorial_issues.json**, **PRACTICE_STATUS.json**, **source_manifest.json**, and the incoming **HCDW Website Content Refresh** text. Page IDs below identify master destinations, not approved production URLs.

The master still has HCDW placeholders, but the new HCDW source is now supplied: do **not** ask for it again. EAICG's commercial/customer-journey scope is still unprovided. AWS v1.2 is incorporated; GCP was rechecked without a source change. Older issue-ledger statements are historical, not automatically open tasks. In particular, original AIG classification questions are superseded where D-01–D-06 settled them. Independent proof and publication checks remain valid. Product naming and release availability were **not externally researched in this audit**; those checks are not being transferred wholesale to practice leads.

## HCDW — practice lead

### HCDW-01 · publication_gate — What can be delivered and tested now?
**Question:** Which resilience capabilities can HCDW actually deliver across the promoted workloads and partners?

**Basis:** HCDW §§2.3 and 3 include AD/Entra/Okta recovery and AI resilience; §3.2 says “Clean recovery, every time.” Supply a deliverable-now/pilot/not-offered matrix, supported versions/licences, recovery-test evidence and acceptance conditions, with the accountable delivery role.

**Until then:** Stage scoped backup/recovery outcomes, not universal clean-recovery or compliance assurances. Identify hand-offs to ISPG/CSG without moving practice ownership. **Pages:** hcdw, hcdw-resilience, hcdw-workspace.

### HCDW-02 · publication_gate — What substantiates build-and-run accountability?
**Question:** What operating scope and credential relevance support the HCDW promise?

**Basis:** §2.5 says “The team that designs your environment also operates and supports it,” reinforced by “AWS Managed Service Provider Competency.” Confirm supported platforms, hours, action/escalation authority and approved continuity wording. Reuse AWS-01 for the exact credential, entity, scope and evidence.

**Until then:** Recommend shared architecture records and accountable hand-offs, not the same personnel throughout. Do not use an AWS credential as proof of every hybrid/workspace service. **Pages:** hcdw, hcdw-infrastructure, hcdw-workspace, how-we-work.

### HCDW-03 · can_progress — What is the assessment package?
**Question:** What does a customer receive from the proposed Resilience Readiness Assessment, and when can the team accept it?

**Basis:** HCDW §2.1 proposes “Take a Resilience Readiness Assessment.” Provide entry criteria, customer inputs, included workloads, tangible output, exclusions, commercial basis, delivery/approval role and capacity; a redacted sample is useful.

**Until then:** Use “Discuss your resilience priorities”; no free, fixed-duration or automatic-availability claim. **Pages:** hcdw, hcdw-resilience, contact.

## CSG — practice lead

### CSG-01 · publication_gate — Which BluForge service components are operational?
**Question:** Which of Ops, Pulse, Assist and Shield are sellable now, and who approves each commitment?

**Basis:** csg-managed, “Four connected service components” and “Make the operation visible,” describe four components and L1/L2/L3 roles. Supply one row each: readiness, supported non-Microsoft platforms, staffing/coverage, retainer limits, action authority, delivery/commercial approver and service evidence.

**Until then:** Keep agreed-scope language; no universal 24/7 response, cross-cloud availability or exclusive brand ownership. This does **not** reopen AIG D-02's IntelliGuard platform definition. **Pages:** csg-managed, csg-endpoint, platforms-ip, secure.

### CSG-02 · can_progress — What is the first DefenceIQ purchase or enquiry?
**Question:** What is the smallest approved DefenceIQ engagement a customer can request now?

**Basis:** csg-advisory spans maturity assessment, testing, privacy readiness, architecture and tabletop work under one advisory description. Select the initial package, inclusions/exclusions, authorisation requirements, customer output, commercial basis, delivery capacity and approver; link an approved scope.

**Until then:** Present selectable capabilities and a scope conversation, not an all-inclusive entitlement or software product. **Pages:** csg-advisory, csg, contact.

## ISPG — practice lead

### ISPG-01 · publication_gate — What do the named assets actually represent?
**Question:** What customer-facing role, maturity and accountable owner belong to MigrationX, ThreatDoctor, DefendX, IntelliCloud and SCCMInsightsX?

**Basis:** ispg-migration, microsoft-security and ispg-hybrid name these assets; ledger ispg-ip-boundaries records missing specifications and commercial definitions. Supply five compact rows: approved wording, applicable seven-type classification, customer deliverable, relationship to other tooling, readiness, accountable role and evidence.

**Until then:** No invented proprietary-software status, standalone product page or ready-to-buy promise. **Pages:** ispg-migration, microsoft-security, ispg-hybrid, platforms-ip.

### ISPG-02 · publication_gate — How does the workplace engagement enter operation?
**Question:** What is the real hand-off from implementation/adoption to security response, backup recovery and continuing support?

**Basis:** ispg-managed promises a “unified support model”; microsoft-workplace connects Copilot, adoption and controls. Provide one operating path with supported services/licensing prerequisites, acceptance output, coverage, action authority, escalation roles, service evidence and capacity; coordinate HCDW/Azure interfaces.

**Until then:** Keep Microsoft Security in ISPG and HCDW recovery distinct. Withhold unsupported hours, badge and feature-entitlement claims. **Pages:** microsoft-workplace, microsoft-security, ispg-hybrid, ispg-managed, hcdw-resilience.

## AIG — practice lead

### AIG-01 · publication_gate — What evidence supports current readiness?
**Question:** What current release and deployment evidence supports the **already-approved** platforms and AIR validation pathway?

**Basis:** aig, “Our Enterprise AI Platforms,” carries Intellient, IntelliLink, IntelliSphere, BluForge IntelliGuard and Quadra AIR. Supply a release register: component/version, available/pilot/internal/planned, supported environments/integrations, exact accountable delivery/approval role, dated evidence and customer-use restrictions. For AIR, give graduation criteria and a releasable example; distinguish Customer Zero from external proof.

**Until then:** Preserve approved definitions; gate unsupported readiness claims only. **Do not reopen D-01–D-06 or AIR's definition.** **Pages:** aig, aig-engineering, aig-governance, platforms-ip, intellient.

### AIG-02 · can_progress — Which workflow makes the proposition tangible?
**Question:** Which one current workflow best demonstrates AIM discovery → governed production → managed AI?

**Basis:** aig-advisory promises a value case and roadmap; aig-managed promises evaluation, observability and continuity. Provide the business constraint, growth/operating objective, AIM package boundary, cloud/model choice rationale, human approval point, acceptance measure, run owner/capacity and permitted evidence or unchanged customer-story link.

**Until then:** Label a demonstrator or illustrative pattern honestly; no invented result, fixed assessment duration or ROI. Retain hyperscaler and independent-lab choice. **Pages:** aig, aig-advisory, aig-automation, aig-managed, transform.

## Azure — practice lead

### AZURE-01 · can_progress — Which Launchpad offer is current?
**Question:** What single current Azure AI Launchpad offer should receive website enquiries?

**Basis:** azure-data-ai, “Start with Azure AI Launchpad,” describes discovery; ledger launchpad-offer-boundary distinguishes a historical two-day Marketplace workshop. Confirm format, eligibility, inputs/outputs, commercial/funding basis, availability, accountable role and enquiry destination.

**Until then:** Keep scoped discovery and roadmap language. No automatic free/funded/two-day/Marketplace promise; do not merge different offers through the shared name. **Pages:** azure-data-ai, azure, contact.

### AZURE-02 · publication_gate — Which service towers and cadence are real?
**Question:** Which seven Max-IT Azure areas can be supported now, with what review cadence and specialist interfaces?

**Basis:** azure-managed lists seven towers and says “Quarterly roadmaps”; azure-security links broader Microsoft security to ISPG. Supply availability/coverage by tower, platform limits, cadence, authority, ISPG/AIG interfaces, approved scope and a redacted service-review output.

**Until then:** Qualify unsupported towers and use an agreed cadence rather than universal quarterly delivery. Keep Max-IT a service brand. **Pages:** azure-managed, azure-security, azure-data-ai, how-we-work.

## AWS — practice lead

### AWS-01 · publication_gate — What supports the credential counts?
**Question:** What dated evidence supports the submitted counts and exact MSP credential now cited by HCDW?

**Basis:** ledger AWS-02–04 quotes “4 AWS Competencies,” “4 AWS Partner Programs” and “120+ AWS Certifications”; HCDW §2.5 adds the MSP assertion. Supply exact titles, entity/geographic scope, validity, counting method/as-of date, badge rights and evidence URLs. Distinguish certifications from certified people.

**Until then:** Keep the withheld counts/credentials withheld; share this evidence with HCDW-02 without extending its scope. **Pages:** aws, partners, recognition, hcdw.

### AWS-02 · publication_gate — What supports the Max-IT operating promise?
**Question:** What approved scope covers AWS operations, automation and the in-house architecture-assessment method?

**Basis:** aws-managed spans CloudOps through strategic advisory and names an “in-house assessment accelerator.” Confirm supported services, staffed coverage, action authority, recovery/reporting cadence, accountable role and approved scope; provide an accelerator output and current delivery use.

**Until then:** No blanket 24x7, fixed-response or new proprietary-product implication; retain agreed-scope language and specialist escalation. **Pages:** aws-managed, aws-security, aws-migration, how-we-work.

### AWS-03 · publication_gate — Which workflow opportunities are ready to show?
**Question:** Which two or three of the nine opportunities are strongest for a real customer conversation?

**Basis:** aws-ai-use-cases says “nine proposed AI workflow opportunities”; ledger AWS-18–20 withheld “proven” and “Ready-to-Deploy.” Give a brief status for all nine; provide integration needs, ready/bespoke boundary, human approvals, acceptance criteria, owner and demo/proof only for the priority two or three.

**Until then:** Preserve opportunity—not shipped-product—framing and authorised human underwriting decisions. **Pages:** aws-ai-use-cases, aws-agentic-ai, aws.

## Google Cloud — practice lead

### GCP-01 · publication_gate — What experience is demonstrable today?
**Question:** Which priority Gemini/Google Cloud AI experience and security integration can the team demonstrate and deliver under actual entitlements?

**Basis:** gcp-gemini conditions connectors on the environment and offers a demonstration; gcp-security conditions integrations/coverage. Provide one use case with tested connectors, edition/region prerequisites, permission/approval controls, delivery role/capacity and dated evidence; identify proposed-only BluForge integration.

**Until then:** Preserve corrected copy; do not revive automatic entitlements or unsupported integration readiness. Vendor naming research remains a separate release task. **Pages:** google-cloud, gcp-ai, gcp-gemini, gcp-security.

### GCP-02 · can_progress — What connects the entry package to operation?
**Question:** What current assessment/startup package leads to an actually supported Max-IT service?

**Basis:** gcp-managed separates provider and Quadra support; gcp-startups qualifies programme access; ledger commercial-promotions withheld a free managed-service month. Confirm onboarding outputs, coverage, responsibilities, review output, commercial terms, eligibility, delivery role and capacity.

**Until then:** No free month, guaranteed credits or platform-wide support; retain scoped enquiries. Do not merge AIMS and AIM. **Pages:** gcp-managed, gcp-startups, google-cloud, contact.

## EAICG — lead and central commercial journey owner

### EAICG-01 · can_progress — Which commercial journeys belong here?
**Question:** Which customer enquiries should EAICG support within the existing site?

**Basis:** No EAICG technical charter is supplied; contact already separates architecture, licensing/quotation and existing-customer help. Confirm whether quotation/licensing, renewals, commercial advisory and existing-customer enquiries are in scope, with receiving roles/channels and hand-offs for applicable journeys.

**Until then:** Keep the current architecture and generic commercial enquiry wording. Do not invent a technical practice, acronym expansion or navigation branch. **Pages:** contact, solutions, how-we-work.

### EAICG-02 · publication_gate — What happens after the enquiry?
**Question:** What useful response can the customer expect, and who has capacity and authority to provide it?

**Basis:** contact says “Reach the team that can help with commercial requirements” but has no intake/response contract. Provide minimum inputs, first deliverable, receiving/escalation role, approved response wording, capacity and exclusions.

**Until then:** A non-live preview can progress; activate no new production route or response-time promise until tested. Do not silently redirect existing support. **Pages:** contact, azure-data-ai, gcp-startups.

## Central DMG / web owner — with relevant approval roles

### CENTRAL-01 · publication_gate — Who clears proof and copy, by when?
**Question:** Who can approve the shared evidence register and final copy, with what realistic review date/capacity?

**Basis:** home retains “21 Years of Global Recognition” and existing result excerpts; credential-proof records conflicting corporate totals. Supply one approval roster and dated register for corporate/practice credentials, delivery geography, results and exact unchanged Happy Customers links/rights, with evidence, approving role and escalation date.

**Until then:** Keep records untouched, withhold unsupported new assertions and gate unresolved retained claims. Close superseded ledger questions; AIG wording approval does not certify independent proof. **Pages:** home, partners, recognition, happy-customers, platforms-ip, technology.

### CENTRAL-02 · can_progress — What CoE experience can visitors actually access?
**Question:** What is available physically at the CoE and digitally through IntelliXperience?

**Basis:** coe is structure-only; platforms-ip says “physical and digital boundaries require confirmation.” Confirm available experiences, audience/customer takeaway, demo and data permissions, booking capacity, session/venue owner and receiving CTA role.

**Until then:** Use an experience-venue introduction and generic enquiry; no unsupported digital-platform, self-service-lab or bookable-session promise. Floor themes remain themes, not routes. **Pages:** coe, platforms-ip, aig-engineering, why-quadra, contact.

### CENTRAL-03 · staging_blocker — What enables a tested Framer import?
**Question:** Which actual project/schema/access can be used, and who owns the production release gate?

**Basis:** PRACTICE_STATUS requires actual component/CMS mapping before staging; contact is form_preview and Compass/newsletter behaviours are not verified integrations. Provide project ID, staging URL, CMS/component fields and types/repeaters/references/slugs, existing case/redirect mapping, authorised access, current pricing/subscription plan and limits, form destinations, consent/analytics requirements and test/release approvers.

**Until then:** Content and generic CSV can progress as **prepared/unmapped**, never “import-tested.” Test routing, links, accessibility, consent, analytics, Compass source/fallback behaviour and newsletter before explicit production approval. No production change is authorised here. **Pages:** home, contact, happy-customers, privacy, terms, technology, solutions.

## What the editorial team can progress without another practice questionnaire

Apply the approved brand hierarchy; give pages distinct customer jobs; remove duplication; align closed AIG references; draft workflow and hand-off structures; prepare a generic export; and maintain conservative wording around unverified claims. Researchable public product names are separate from internal delivery evidence. The five recommended positioning changes are in **positioning_review.md**; the machine-readable question register is **practice_clarifications.json**.

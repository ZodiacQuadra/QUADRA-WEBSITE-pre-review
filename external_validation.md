# External validation — 27 October 2026

Targeted checks of product terminology, availability and claim scope. These do not validate Quadra-specific delivery or credentials.

## GCP-01 · Google Cloud
**Finding:** qualify. Google documents Agent Runtime naming and SDK migration; unchanged workload behaviour should not be promised without assessment.
**Action:** Use current runtime terminology where named; keep migration planning and dependencies explicit.
Sources:
- Introducing Gemini Enterprise Agent Platform, powering the next wave of agents — Google Cloud; 2026-04-22 — https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform
- Agent Runtime SDK migration guide — Google Cloud; unknown — https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime/sdk-migration
- Vertex AI SDK migration guide (French locale page) — Google Cloud; unknown — https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deprecations/genai-vertexai-sdk?hl=fr

## GCP-02 · Google Cloud
**Finding:** qualify. Notebook capabilities depend on Gemini Enterprise edition and availability; current naming must be applied consistently.
**Action:** Avoid unrestricted feature promises; qualify editions and preview functions before specific offer publication.
Sources:
- NotebookLM is now Gemini Notebook — Google; 2026-07-16 — https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/
- Use Gemini Notebook Enterprise within Gemini Enterprise — Google Cloud; 2026-10-20 (last updated) — https://docs.cloud.google.com/gemini/enterprise/docs/access-notebooklm

## GCP-03 · Google Cloud
**Finding:** qualify. Data Studio succeeds Looker Studio; it is not synonymous with the separate Looker product or a data warehouse.
**Action:** Keep data-platform and BI roles distinct; avoid the original Looker-to-Data-Studio equivalence.
Sources:
- Looker Studio is Data Studio (Data Studio returns as new home for Data Cloud assets) — Google Cloud; 2026-04-10 — https://cloud.google.com/blog/products/data-analytics/looker-studio-is-data-studio
- Welcome to Data Studio — Google Cloud; unknown — https://docs.cloud.google.com/data-studio/welcome

## GCP-04 · Google Cloud
**Finding:** correct. Grounding and guardrails reduce risks; they do not eliminate inaccurate answers or replace configured permissions.
**Action:** Use evaluation, source grounding and access-control language, not guarantees of correctness or protection.
Sources:
- Grounding overview | Gemini Enterprise Agent Platform — Google Cloud; unknown — https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/grounding/overview
- Agent Platform overview — Google Cloud; unknown — https://docs.cloud.google.com/gemini-enterprise-agent-platform/overview
- Set up a Microsoft SharePoint data store — Google Cloud; unknown — https://docs.cloud.google.com/gemini/enterprise/docs/connectors/ms-sharepoint/set-up-data-store
- Expanding Google Antigravity for enterprise customers — Google Cloud; 2026-08-20 — https://cloud.google.com/blog/products/ai-machine-learning/expanding-google-antigravity-for-enterprise-customers

## GCP-05 · Google Cloud
**Finding:** not publicly verified. Quadra’s Google credentials were found as self-published assertions; independent directory verification was unavailable in this review.
**Action:** Omit unsupported tiers, counts and zero-downtime guarantees from clean draft; request current evidence privately.
Sources:
- Enterprise Cloud Technology Consulting | Quadra (self-published) — Quadra (self); unknown — https://www.quadrasystems.net/technology
- Google Cloud Find a Partner (query attempted) — Google Cloud; unknown — https://cloud.google.com/find-a-partner/?q=Quadra

## AZ-01 · Microsoft Azure
**Finding:** confirmed. Microsoft Foundry is the current platform name in Microsoft Learn.
**Action:** Retain Microsoft Foundry terminology, without inferring every feature is generally available.
Sources:
- What is Microsoft Foundry? — Microsoft Learn; unknown — https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry
- Microsoft Foundry documentation — Microsoft Learn; unknown — https://learn.microsoft.com/en-us/azure/foundry/

## AZ-02 · Microsoft Azure / ISPG (cross-practice)
**Finding:** qualify. Foundry and Agent 365 have distinct roles; individual features have separate licensing and availability conditions.
**Action:** Cross-link Azure build/run and Microsoft governance pages rather than duplicate or merge product roles.
Sources:
- Microsoft Agent 365, now generally available, expands capabilities and integrations — Microsoft Security Blog; 2026-05-01 — https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/
- Introducing the First Frontier Suite built on Intelligence + Trust — Microsoft (Official Microsoft Blog); 2026-03-09 — https://blogs.microsoft.com/blog/2026/03/09/introducing-the-first-frontier-suite-built-on-intelligence-trust/

## AZ-03 · Microsoft Azure
**Finding:** qualify. Fabric and Databricks interoperate, with read-only and access-control considerations for mirrored data.
**Action:** Keep assessment-led complementary positioning; do not imply Databricks permissions automatically propagate into Fabric.
Sources:
- Mirroring Azure Databricks Unity Catalog (Microsoft Fabric) — Microsoft Learn; unknown — https://learn.microsoft.com/en-us/fabric/mirroring/azure-databricks
- Use Microsoft Fabric to read data that is registered in Unity Catalog — Microsoft Learn (Azure Databricks docs); 2026-10-06 (last updated) — https://learn.microsoft.com/en-us/azure/databricks/partners/bi/fabric-mirror

## ISPG-01 · ISPG (Microsoft 365 / Microsoft Security)
**Finding:** not publicly verified. Frontier Partner is an official specialization; that fact does not confirm Quadra’s attainment.
**Action:** Do not replace a current credential with Frontier Partner merely because the programme exists.
Sources:
- Frontier Partner specialization — Microsoft; unknown — https://partner.microsoft.com/en-us/partnership/specialization/frontier-partner
- September 2026 announcements - Partner Center — Microsoft Learn; 2026-09-30 — https://learn.microsoft.com/en-us/partner-center/announcements/2026-september

## ISPG-02 · ISPG (Microsoft 365 / Microsoft Security)
**Finding:** confirmed. Microsoft uses AI Business Solutions and Microsoft 365 E7 terminology; rollout remains subject to actual licence and feature conditions.
**Action:** Use normal product names, not ME7 shorthand; retain customer-oriented workplace navigation.
Sources:
- Lead Frontier Transformation with Microsoft 365 E7, now generally available — Microsoft Partner Network; 2026-05-01 — https://partner.microsoft.com/en-us/blog/article/microsoft-365-e7-general-availability
- New fiscal year, new partner investments — Microsoft Partner Network; 2025-07-31 — https://partner.microsoft.com/en-us/blog/article/new-benefits-designations-specializations
- Introducing the First Frontier Suite built on Intelligence + Trust — Microsoft; 2026-03-09 — https://blogs.microsoft.com/blog/2026/03/09/introducing-the-first-frontier-suite-built-on-intelligence-trust/

## ISPG-03 · ISPG / AIG / CSG (corporate recognition)
**Finding:** not publicly verified. Microsoft schedules 2026 Partner of the Year winner and finalist announcements for 11 November 2026.
**Action:** Keep the user-approved 21-year planned-launch copy in this private review only; publication still requires announcement and owner confirmation. Never use consecutive or unbroken.
Sources:
- Get your nominations in now for the 2026 Microsoft Partner of the Year Awards — Microsoft Partner Network; 2026-06-24 — https://partner.microsoft.com/en-us/blog/article/partner-of-the-year-awards-2026-submit-your-nomination
- Awards - partner.microsoft.com — Microsoft; unknown — https://partner.microsoft.com/en-us/awards

## CSG-01 · Cybersecurity (CSG, non-Microsoft)
**Finding:** correct. Fortinet and CrowdStrike provide CNAPP capabilities; CSG’s non-Microsoft scope is governed by the user’s explicit decision.
**Action:** Remove Microsoft implementation claims from CSG and cross-link the independent Microsoft Security practice; do not alter reporting responsibilities.
Sources:
- Cloud-Native Application Protection Platform (FortiCNAPP) — Fortinet; unknown — https://www.fortinet.com/products/forticnapp
- CrowdStrike Falcon Cloud Security: CNAPP — CrowdStrike; unknown — https://www.crowdstrike.com/en-us/platform/cloud-security/cnapp/

## CSG-02 · Cybersecurity (CSG, non-Microsoft)
**Finding:** not publicly verified. Zscaler DSA terminology exists; Quadra’s authorization and awards remain unverified here.
**Action:** Hold named partner-status claims until current partner-portal or authorization evidence is supplied.
Sources:
- Compugen Achieves Zscaler Delivery Services Authorization (includes Zscaler spokesperson quote) — Compugen (third-party partner); 2026-06-30 — https://resources.compugen.com/en-ca/news-awards/compugen-achieves-zscaler-delivery-services-authorization
- Zscaler Partner Services: Enablement & Quality Assurance (data sheet) — Zscaler; 2026-06 — https://www.zscaler.com/resources/data-sheets/zscaler-partner-services-enablement-quality-assurance.pdf

## CSG-03 · Cybersecurity (CSG, non-Microsoft)
**Finding:** correct. Fortinet certification terminology changed in July 2026; current vendor tiers and individual badges require evidence.
**Action:** Avoid unconfirmed partner tiers and certification badge lists; verify the actual current awards/certificates.
Sources:
- How will my current certifications transition to the new NSE certifications on July 15, 2026? — Fortinet Training Institute; 2026-07-16 (modified) — https://helpdesk.training.fortinet.com/support/solutions/articles/73000667146-how-will-my-current-certifications-transition-to-the-new-nse-certifications-on-july-15-2026-
- Accelerate Partner Program — CrowdStrike; unknown — https://www.crowdstrike.com/en-us/partner-program/
- 2026 Partner Program Updates: Built to Reward Your Value — Sophos; 2026-04-16 — https://www.sophos.com/en-us/partner-news/2026-partner-program-updates-built-to-reward-your-value

## CSG-04 · Cybersecurity (CSG, non-Microsoft)
**Finding:** qualify. AI-security features vary by licensed platform; public capability descriptions do not confirm a universal implementation scope.
**Action:** Keep cyber-control scope separate from AIG lifecycle governance and use actual licence/telemetry dependencies.
Sources:
- AI Guard for Apps: Secure Prompts & DLP — Zscaler; unknown — https://www.zscaler.com/products-and-solutions/ai-guard-for-apps
- Zscaler AI Guard solution brief — Zscaler; 2026 (copyright) — https://www.zscaler.com/resources/solution-briefs/zscaler-ai-guard.pdf

## AIG-01 · AIG (Enterprise AI Engineering)
**Finding:** qualify. A Quadra-issued announcement describes AI-practice ISO/IEC 42001 certification; the certificate and its scope were not independently inspected.
**Action:** Keep certification scope out of the draft until the certificate is confirmed; do not call every customer AI product certified.
Sources:
- Quadrasystems.net Among the First in India to Achieve ISO/IEC 42001:2023 (press release) — PR Newswire (issued by Quadrasystems.net); 2026-06-29 — https://www.prnewswire.com/in/news-releases/quadrasystemsnet-among-the-first-in-india-to-achieve-isoiec-420012023-the-worlds-first-international-standard-for-ai-management-systems-302812910.html

## AIG-02 · AIG (Enterprise AI Engineering)
**Finding:** not publicly verified. Quadra’s public AWS competency descriptions differ; authoritative partner evidence is required before choosing credential wording.
**Action:** Use correct product brands and leave unconfirmed credential tiers out of the clean mockup.
Sources:
- Quadra Bridges the 'Execution Gap' in AI: Achieves Dual Milestone with AWS Premier Tier Status and AI Services Competency — Business Standard (PRNewswire advertorial issued by Quadra); 2026-04-02 — https://www.business-standard.com/content/press-releases-ani/quadra-bridges-the-execution-gap-in-ai-achieves-dual-milestone-with-aws-premier-tier-status-and-ai-services-competency-126040200432_1.html
- AWS Premier Partner | Quadra (self-published) — Quadra (self); unknown — https://www.quadrasystems.net/technology/aws

## AIG-03 · AIG (Enterprise AI Engineering)
**Finding:** confirmed. European Commission guidance describes applicable AI transparency duties; it does not certify a customer deployment or Quadra service.
**Action:** Retain conditional compliance-readiness language, not blanket certification or legal guarantees.
Sources:
- Quick Facts: Transparency rules for AI systems — European Commission; 2026-07-29 (last update) — https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems
- Not Delayed, Not Deferred: EU AI Act Transparency Obligations Are Now in Force — Goodwin (law firm); 2026-08-03 — https://www.goodwinlaw.com/en/insights/publications/2026/08/alerts-technology-dpc-eu-ai-act-transparency-obligations-now-in-force

## Review limits
- No Quadra partnership tier independently confirmed.
- Customer metrics, service hours/SLAs, certification scope and release permissions remain owner checks.
- Barracuda programme names, full ISPG specialization list and Indian data-protection-law mapping were not comprehensively validated.
- Some official pages are undated; no post-cutoff dated evidence intentionally used.
- No production website changes or announcements.

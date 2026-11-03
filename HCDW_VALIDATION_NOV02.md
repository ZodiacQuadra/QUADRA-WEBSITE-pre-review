# HCDW OEM Claim Validation — as of 2 Nov 2026

Scope: targeted primary-source checks of the HCDW draft (`hcdw_source.txt`). Verifies **OEM product names, features and availability only**. Quadra partner tiers, AWS MSP Competency, "certified depth", SLAs, sector delivery and customer outcomes were **not verified**. Approved CSG/ISP/GAIG scope not re-evaluated. Machine-readable twin: `hcdw_validation.json`.

Finding key: **confirmed_concept** = keep with light wording care · **correct** = factual/name fix needed · **qualify** = true but announcement/preview/edition/vendor-claim caveat needed · **not_verified** = no primary source found; use neutral copy.

## Summary table

| ID | Topic | Finding | Safe direction (short) |
|---|---|---|---|
| CV-01 | Commvault Cloud Unity + Satori | qualify | "Unity platform release"; features roll out by deployment; Satori = data/AI access governance |
| CV-02 | Commvault identity (AD/Entra/Okta) | qualify | Cross-provider auditing + Tier 0 intelligence = announced, early access (IDRecover), not GA |
| CV-03 | Synthetic Recovery, Cleanroom, Arlie, Metallic AI | confirmed_concept | Keep names; soften absolute outcomes |
| CV-04 | Data Activate | qualify | Announced/"forthcoming" (Apr 2026); confirm GA before listing |
| VE-01 | Veeam DataAI Command Platform / Securiti | qualify | Acquisition closed Dec 2025; platform announced May 2026; resilience modules in preview |
| VE-02 | "DataAI Agent Commander" | correct | Name is **Veeam Agent Commander**; announced, future release/early access |
| VE-03 | 100+ frameworks; DPDP/RBI/SEBI/IRDAI | qualify | Attribute count to Veeam or drop; India mapping = Quadra advisory, not OEM |
| VE-04 | v13.1 AD forest recovery; VRO testing | confirmed_concept | Add edition caveat; VRO targets vSphere/Hyper-V/Azure; drop "zero impact" absolute |
| DR-01 | Druva Copilot + Claude backup | correct | Claude = Claude Code/Cowork on managed Win/macOS endpoints; Claude.ai chats out of scope |
| DR-02 | Druva Identity Resilience | confirmed_concept | Keep AD/Entra/Okta + forest recovery; remove "no DC restart"/BYOK unless confirmed |
| DR-03 | $10M guarantee; 26 regions | correct | "Data Resiliency Guarantee, up to $10M, qualifying customers"; regions vary by workload |
| VND-01 | 3x TCO / 40% savings | not_verified | Omit figures; neutral consolidation copy |
| EUC-01 | XenMobile, UEM OS support, NetScaler | correct | "Citrix Endpoint Management"; OS coverage varies by tool; no "one policy framework" |
| INF-01 | VCF, OpenShift Virtualization | confirmed_concept | Keep; standard component terms confirmed |

## Row detail

### CV-01 Commvault Cloud Unity + Satori — qualify
- Evidence: Announced 12 Nov 2025 as a "platform release"; parts available late 2025 with rollouts into early 2026. Satori intent announced Jul 2025; a Commvault blog cites "recent integration of Satori Cyber."
- Safe direction: "Commvault Cloud (Unity platform release)"; don't imply every capability exists in every deployment model (software, SaaS, appliance).
- Sources: [Commvault PR, 2025-11-12](https://www.commvault.com/en-gb/news/new-era-in-enterprise-resilience-commvault-cloud-unity-platform-release) · [Commvault blog, 2025-11-12](https://www.commvault.com/blogs/introducing-the-commvault-cloud-unity-platform-release) · [Satori PR, 2025-07-24](https://www.commvault.com/news/commvault-announces-intent-to-acquire-data-and-ai-security-company-satori-cyber)

### CV-02 Commvault identity resilience — qualify (high risk)
- Evidence: The 28 Oct 2026 release covers AD, Entra ID and Okta auditing, Tier 0 exposure and AI-guided remediation. Auditing and attack intelligence are "planned for early access in the coming quarters" under Commvault IDRecover.
- Safe direction: List as announced/early-access, not current. Keep "granular and forest-level AD recovery" out unless Commvault confirms the current scope (not verified in this pass).
- Sources: [Commvault PR, 2026-10-28](https://www.commvault.com/news/commvault-advances-identity-resilience-identify-and-manage-hidden-risks) · [Unity PR, 2025-11-12](https://www.commvault.com/en-gb/news/new-era-in-enterprise-resilience-commvault-cloud-unity-platform-release)

### CV-03 Commvault recovery + AI ops — confirmed_concept
- Evidence: An Apr 2026 blog describes file-level Synthetic Recovery, Cleanroom runbooks, and Arlie incident summaries. The undated Metallic AI page covers Arlie agents and MCP.
- Safe direction: Use "Commvault Cleanroom" and "Arlie (AI assistant)". Describe Metallic AI as Commvault Cloud's AI/automation layer. Write "helps avoid reinfection", not "avoiding reinfection".
- Sources: [Commvault blog, 2026-04-09](https://www.commvault.com/blogs/commvault-enhancements-in-cyber-recovery) · [Metallic AI, undated](https://www.commvault.com/platform/metallic-ai) · [Meet Arlie, modified 2026-07-02](https://www.commvault.com/meet-arlie)

### CV-04 Data Activate — qualify
- Evidence: The Apr 2026 release calls Data Activate, AI Protect and AI Studio "new and forthcoming." The blog says it evolved from Data Rooms and uses Parquet/Iceberg with Azure and Snowflake.
- Safe direction: "announced"; confirm GA before it appears as a current capability.
- Sources: [Commvault PR, 2026-04-13](https://www.commvault.com/news/commvault-introduces-innovations-to-advance-secure-controlled-agentic-transformation-in-the-enterprise) · [Commvault blog, 2026-04-13](https://www.commvault.com/blogs/data-activate-unlocking-the-power-of-trusted-data-for-ai-innovation)

### VE-01 Veeam DataAI Command Platform — qualify
- Evidence: The Securiti AI acquisition closed 11 Dec 2025. The platform was announced 12 May 2026 with a *preview* of the DataAI Resilience Module and ResOps for M365. The graph's name moved from "Data Command Graph" to "DataAI Command Graph".
- Safe direction: Use the current names; mark the resilience modules as preview unless GA is confirmed. Keep Veeam Data Platform as the backup core.
- Sources: [Veeam PR, 2025-12-11](https://www.veeam.com/company/press-release/veeam-acquires-securiti-ai.html) · [Veeam PR, 2026-05-12](https://www.veeam.com/company/press-release/veeam-launches-dataai-command-platform-the-industrys-first-unified-data-and-ai-trust-infrastructure-for-the-agentic-era.html)

### VE-02 Agent Commander — correct
- Evidence: The Feb 2026 release names the product "Agent Commander", available "in a future release" of the Securiti Data Command Center. The blog offers early access. This pass found no GA confirmation.
- Safe direction: "Veeam Agent Commander (announced)"; don't claim a complete inventory of all agents and models.
- Sources: [Veeam PR, 2026-02-24](https://www.veeam.com/company/press-release/veeam-introduces-agent-commander-to-confront-agentic-ai-risk-at-enterprise-scale.html) · [Veeam blog, 2026-02-24/03-11](https://www.veeam.com/blog/agent-commander-ai-risk-solution.html)

### VE-03 Framework count + India regulators — qualify
- Evidence: Veeam states mapping to "100+ regulatory frameworks" (a vendor claim). No OEM source maps DPDP, RBI, SEBI or IRDAI.
- Safe direction: Drop the count (the brief says to omit unneeded marketing counts) or attribute it to Veeam. Present Indian-regulator alignment as Quadra advisory mapping, subject to scoping. It is not an OEM certification or a compliance guarantee.
- Source: [Veeam PR, 2026-05-12](https://www.veeam.com/company/press-release/veeam-launches-dataai-command-platform-the-industrys-first-unified-data-and-ai-trust-infrastructure-for-the-agentic-era.html)

### VE-04 v13.1 AD forest recovery + Recovery Orchestrator — confirmed_concept
- Evidence: v13.1 became GA on 29 Jul 2026 with guided, automated AD forest recovery. Some features are Advanced or Premium edition only. Four-eyes immutability and automated DR tests appear on the Veeam GRC page. VRO orchestrates recovery to vSphere, Hyper-V and Azure, with isolated test labs and compliance reports.
- Safe direction: Add "edition-dependent". Write "isolated, non-disruptive DR testing" rather than "zero production impact".
- Sources: [Veeam PR, 2026-07-29](https://www.veeam.com/company/press-release/veeam-data-platform-v13-1-now-available-helping-organizations-recover-clean-and-fast-from-cyber-disruption.html) · [VBR What's New, undated](https://helpcenter.veeam.com/docs/vbr/wn/identity_protection.html?ver=13) · [VRO guide, 2026-08-26](https://helpcenter.veeam.com/docs/vro/userguide/overview.html) · [Veeam GRC page, undated](https://www.veeam.com/products/veeam-data-platform/governance-risk-compliance.html)

### DR-01 Druva Copilot + Claude — correct (high risk)
- Evidence: The Jul 2026 launch added Microsoft Copilot protection and *Claude Code* protection via the Resilience Cloud and Dru MetaGraph. The Claude Backup FAQ says Claude.ai chat history is not backed up. Coverage is locally stored Claude Code/Cowork data, delivered through Druva Endpoints on Windows and macOS.
- Safe direction: Replace "Claude conversations, prompts, projects" with "Claude Code and Cowork project data on managed endpoints".
- Sources: [Druva PR, 2026-07-21](https://www.druva.com/why-druva/about/press-releases/druva-advances-ai-resilience) · [Claude Backup page, undated](https://www.druva.com/use-cases/ai-resilience/ai/claude-backup) · [Druva blog, 2026-03-30](https://www.druva.com/blog/druva-claude-backup-for-ai-work)

### DR-02 Druva Identity Resilience — confirmed_concept
- Evidence: The Mar 2026 launch added Okta and AD alongside Entra ID, including full forest-level recovery. Aug 2026 docs confirm Enterprise per-user licensing.
- Safe direction: Remove "without restarting DCs" and "BYOK" unless confirmed (not checked).
- Sources: [Druva PR, 2026-03-17](https://www.druva.com/why-druva/about/press-releases/druva-launches-identity-resilience) · [Druva docs, 2026-08-27](https://help.druva.com/en/articles/14085072-druva-identity-resilience)

### DR-03 Guarantee + regions — correct (high risk)
- Evidence: The program is the **Druva Data Resiliency Guarantee**: "up to $10M" through five financially backed SLAs, available to customers who meet program requirements. The agreement covers eligibility, a health check, a guarantee period and exclusions. The Enterprise-workload docs list 26 storage regions (18 AWS, 6 Azure, 2 GovCloud). Dynamics 365 and Salesforce workloads are supported in fewer regions.
- Safe direction: Say "Druva's Data Resiliency Guarantee (up to $10M, for qualifying customers under Druva's terms)". It is not insurance, not universal, and not a Quadra commitment. Replace "26 regions" with "multiple regions; availability varies by workload".
- Sources: [Guarantee page, undated](https://www.druva.com/products/resiliency-guarantee) · [Agreement PDF, undated](https://www.druva.com/documents/resilience-guarantee/agreement.pdf) · [Druva regions, 2026-09-22](https://help.druva.com/en/articles/11401434-supported-cloud-storage-regions-for-enterprise-workloads) · [Druva SaaS regions, 2026-09-09](https://help.druva.com/en/articles/15162912-aws-region-availability-matrix)

### VND-01 3x TCO / 40% savings — not_verified
- Evidence: This bounded pass found no current primary source for either figure. Commvault's 2025 boilerplate makes only a generic "lowest TCO" claim.
- Safe direction: Omit. Neutral copy: "Consolidating protection, security and recovery can reduce tooling and operational overhead; we model cost against your estate."
- Source: [Commvault PR boilerplate, 2025-07-24](https://www.commvault.com/news/commvault-announces-intent-to-acquire-data-and-ai-security-company-satori-cyber)

### EUC-01 Workspace names + OS coverage — correct
- Evidence: Citrix docs (Oct 2026) refer to "Citrix Endpoint Management (formerly, XenMobile)". Omnissa Workspace ONE UEM lists Android, iOS/iPadOS, macOS, Windows, ChromeOS and Linux, and Scalefusion's page lists a similar set. Linux support in Citrix Endpoint Management was not confirmed. NetScaler is the current name.
- Safe direction: Card title becomes "Unified Endpoint Management (Omnissa Workspace ONE, Citrix Endpoint Management, Scalefusion)". Copy: "Manage and secure iOS, Android, Windows, macOS, ChromeOS and Linux devices on the platform that fits — supported OS varies by tool." Drop "one policy framework".
- Sources: [Citrix docs, 2026-10-26](https://docs.citrix.com/us/en/citrix-secure-hub/overview.html) · [Omnissa docs, 2026-10-07](https://docs.omnissa.com/WorkspaceONE-UEM-Managing-Devices-VSaaS/AWT-MANAGINGDEVICESOVERVIEW) · [Scalefusion, undated](https://scalefusion.com/unified-endpoint-management-uem/) · [NetScaler docs, undated](https://docs.netscaler.com/)

### INF-01 VCF + OpenShift Virtualization — confirmed_concept
- Evidence: Broadcom's VCF 9.1 FAQ (Sep 2026) lists vSphere, vSAN, NSX, VKS, VCF Operations, VCF Automation and HCX. Red Hat describes OpenShift Virtualization as running VMs alongside containers, and offers a VM-only Virtualization Engine edition.
- Safe direction: Keep the current terms. "Evaluate Red Hat OpenShift Virtualization where it fits" preserves customer choice.
- Sources: [Broadcom FAQ, 2026-09-03](https://www.vmware.com/docs/vmware-cloud-foundation-9-1-general-faqs) · [Broadcom techdocs, undated](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0.html) · [Red Hat, undated](https://www.redhat.com/en/technologies/cloud-computing/openshift/virtualization)

## Structural implications for customer value (no new top nav)

1. **Resilience beyond backup is real, but uneven by maturity.** All three OEMs now pair recovery with security posture, identity and AI governance. Much of the identity and AI capability, though, is announced, preview or early access (CV-02, CV-04, VE-01, VE-02). Copy should describe outcomes and capability areas (see risk → protect identity → recover clean → prove), with OEM feature names as "available or emerging per OEM". Pillar headlines should not rest on roadmap items.
2. **Identity is a recovery dependency, not a sidecar.** All three vendors treat AD, Entra ID and Okta as Tier 0, and Veeam and Druva document forest-level AD recovery. Inside the existing Data & Cyber Resilience page, frame identity recovery as the *first step* in the recovery sequence ("restore trusted identity before workloads"). This fits "Resilience by design" and needs no new nav item.
3. **Governed recovery for AI should be scoped precisely.** Each OEM covers a different slice: Copilot data (Druva), Claude Code/Cowork on endpoints (Druva), agent rollback (Veeam, announced), and agent governance (Commvault, forthcoming). Use neutral capability copy such as: "Protect and govern the AI data, prompts and configurations you depend on, and be able to roll back unwanted changes — using the OEM capability that matches your AI estate."
4. **Customer choice stays intact.** Present OEMs as options mapped to the estate: private cloud, public cloud, SaaS or endpoint-heavy. Keep the "best fit" column descriptive, not prescriptive. VCF and OpenShift Virtualization are both confirmed and can sit side by side as choices.
5. **Keep OEM and Quadra claims separate.** OEM guarantees, framework counts and TCO figures belong to the OEM, with conditions attached. They are not Quadra outcomes. Quadra-side claims (certified depth, AWS MSP Competency, build-and-run, sector delivery) need internal evidence before staging.

## Neutral fallback copy (for not_verified or roadmap-dependent items)
- Identity: "Visibility and recovery for Active Directory, Entra ID and Okta, with capabilities varying by platform and release."
- AI: "Protection, governance and rollback for AI data and workloads as OEM capabilities mature — scoped to your AI tools."
- Cost: "Consolidation can reduce tooling and operational overhead; we model cost against your estate."
- Compliance: "Evidence and reporting that support your regulatory obligations, mapped by our advisors to your regulators."

## Limitations
- This was a bounded pass (~5 min) of 14 high-risk checks, not an exhaustive feature audit.
- Partner tiers, competencies, certifications, SLAs and customer proof were not verified.
- GA status per region, edition and deployment model was not confirmed for announced items.
- Commvault forest/Okta recovery, Druva BYOK and the "no DC restart" claim, Commvault 3x and Druva 40% were not located in primary sources.
- Undated pages are living documents; recheck them before go-live.
- Druva's AI Resilience overview page describes Claude coverage more broadly than its Claude Backup FAQ; this report uses the narrower FAQ scope.
- OEM superlatives ("first", "#1") are vendor claims, not independent validation.

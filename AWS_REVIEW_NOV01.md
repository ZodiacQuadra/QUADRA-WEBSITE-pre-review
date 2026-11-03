# AWS content normalization — review draft

## Scope and source
- Source: `AWS Web Site Content Update - Oct2026 Ver1.2.docx`; created and modified **1 November 2026, 12:08 UTC**; author **Tamizharasan Natarajan**.
- SHA-256: `c4486f98ddbfac2c9e9c73f5263f6117112c8085147b1f481b5c9ade41ec634d`. DOCX paragraphs match the supplied text extraction exactly after blank-line removal and whitespace trimming.
- Integrated into master/preview review v0.4 on 1 November. No production-site publication, new production URLs or Office-source edits. Original documents remain unchanged.
- Actual supplied update is AWS, not AIG. GCP and AIG are outside this patch; no customer evidence, ownership or staff evaluation changes.

## Measured coverage
- **8 pages**, **58 detailed source sections**, **6 additional overview capability summaries**. The 58 are 5 Infra & Migration + 8 Application & Database Modernization + 8 Data Analytics & Machine Learning + 5 Agentic AI + 9 workflow examples + 11 Managed Services + 12 Security & Governance.
- **66 rendered section objects**: 58 detailed treatments + 6 overview summaries + overview blueprint + Agentic AI child collection link. **97 coverage ledger entries**, including headings, subheadings and held credential claims.
- Every detail retains its own source label and separate problem/approach/outcome treatment. No arbitrary page-length cap. All outcomes are framed as outcomes to work toward, not guaranteed or measured customer results.

| Page ID | Parent | Detail sections | Total sections | Approx. copy words |
|---|---|---:|---:|---:|
| `aws` | `technology` | 0 | 7 | 487 |
| `aws-migration` | `aws` | 5 | 5 | 445 |
| `aws-apps` | `aws` | 8 | 8 | 564 |
| `aws-data-ai` | `aws` | 8 | 8 | 563 |
| `aws-agentic-ai` | `aws` | 5 | 6 | 514 |
| `aws-ai-use-cases` | `aws-agentic-ai` | 9 | 9 | 679 |
| `aws-managed` | `aws` | 11 | 11 | 634 |
| `aws-security` | `aws` | 12 | 12 | 732 |

## Master and navigation mapping used
- Replace only `aws`, `aws-migration`, `aws-data-ai`, `aws-security`, `aws-managed`; add `aws-apps`, `aws-agentic-ai`, `aws-ai-use-cases`.
- Retain the existing AWS column and AWS overview entry. Replace its four capability links with the six below. No new top-level navigation or changes to other practice columns.

| AWS capability label | Page ID |
|---|---|
| Infra & Migration | `aws-migration` |
| Application & Database Modernization | `aws-apps` |
| Data Analytics & Machine Learning | `aws-data-ai` |
| Agentic AI | `aws-agentic-ai` |
| Managed Services | Max-IT | `aws-managed` |
| Security & Governance | `aws-security` |

- Link the use-case collection from Agentic AI only; its parent is `aws-agentic-ai`, not a seventh capability. All other AWS subpages have parent `aws`; overview parent remains `technology`.
- Preserve the independent cross-platform AIG practice. `aws-agentic-ai` links to `aig` and `transform`; it does not merge or overwrite AIG.
- AWS Security is AWS implementation scope; the `csg` link is a related destination, not a transfer of CSG/ISPG remit.
- Four business-priority routes remain `modernize`, `transform`, `secure`, `empower`. Homepage vendor-neutrality is unaffected. Canonical candidates remain null.

## Editorial and owner-verification ledger
- Credential counts and certified wording are held, not silently published. 24x7, always-on, response/SLA, coverage and cadence claims need owner-approved service terms.
- Max-IT remains the source service brand, not invented owned software. The in-house assessment accelerator is retained only as a method.
- AI assistance is scope-dependent, not a mandatory feature of every project. No OEM product names, shipped products, new case studies or numerical benefits have been added.
- “Ready-to-Deploy AI Solutions” becomes “AI Solutions for Business Workflows”; all nine remain as customer-specific proposed opportunities with human review. Loan and insurance examples support human underwriters, not autonomous eligibility/scoring.

### AWS-01 — owner_verification
- Target: `aws`
- Exact source excerpt: Quadra helps organizations plan, migrate, modernize, secure, and operate their AWS environments. Our certified cloud professionals combine architecture expertise, automation, managed operations, data capabilities, and Agentic AI to help customers achieve faster transformation and sustained business value.
- Treatment: Quadra helps organizations plan, migrate, modernize, secure, and operate their AWS environments. Our cloud professionals combine architecture expertise, automation, managed operations, data capabilities, and Agentic AI to help customers achieve faster transformation and sustained business value.
- Reason: Certification wording held pending owner evidence; service scope and architecture-to-operations continuity retained.

### AWS-02 — owner_verification
- Target: `aws`
- Exact source excerpt: 4 AWS Competencies
- Treatment: Held from marketing copy; retained in this verification ledger.
- Reason: Not independently validated. Keep out of marketing copy until the AWS practice owner provides current, applicable evidence.

### AWS-03 — owner_verification
- Target: `aws`
- Exact source excerpt: 4 AWS Partner Programs
- Treatment: Held from marketing copy; retained in this verification ledger.
- Reason: Not independently validated. Keep out of marketing copy until the AWS practice owner provides current, applicable evidence.

### AWS-04 — owner_verification
- Target: `aws`
- Exact source excerpt: 120+ AWS Certifications
- Treatment: Held from marketing copy; retained in this verification ledger.
- Reason: Not independently validated. Keep out of marketing copy until the AWS practice owner provides current, applicable evidence.

### AWS-05 — grammar_edit
- Target: `aws-apps` / `aws-apps-continuous-modernization`
- Exact source excerpt: Sustained application value reduced technical debt, improved performance, and continuous alignment with business priorities.
- Treatment: Sustained application value, reduced technical debt, improved performance, and continuous alignment with business priorities.
- Reason: Repair missing comma; retain all stated outcomes.

### AWS-06 — copy_edit
- Target: `aws` / `aws-capability-agentic-ai`
- Exact source excerpt: Traditional assistants can answer questions, but complex business processes require AI that can reason, maintain context, use approved tools, and execute coordinated actions. Quadra helps organizations design secure and governed AI solutions that connect enterprise knowledge, applications, people, and workflows.
- Treatment: Traditional assistants can answer questions, but complex business processes require AI that can reason, maintain context, use approved tools, and execute coordinated actions. Quadra helps organizations design secure and governed AI solutions that connect enterprise knowledge, applications, people, and workflows. Actions are constrained by tool permissions and approval requirements.
- Reason: Make authorization boundaries explicit without implying unrestricted agent actions.

### AWS-07 — copy_edit
- Target: `aws-agentic-ai`
- Exact source excerpt: Quadra helps organizations move beyond standalone chatbots and assistants by building secure, context-aware AI agents capable of understanding goals, using approved tools, and coordinating multi-step actions.
- Treatment: Quadra helps organizations move beyond standalone chatbots and assistants by building secure, context-aware AI agents capable of understanding goals, using approved tools, and coordinating multi-step actions. Agents operate within defined permissions, approval requirements and monitoring controls.
- Reason: Make approved-tool, permission and human-control boundaries explicit.

### AWS-08 — copy_edit
- Target: `aws-agentic-ai` / `aws-agentic-ai-connected-agents`
- Exact source excerpt: Quadra builds intelligent agents that connect with authorized enterprise knowledge, applications, APIs, databases, and business tools to reason, maintain context, support decisions, and execute governed actions.
- Treatment: Quadra builds intelligent agents that connect with authorized enterprise knowledge, applications, APIs, databases, and business tools to reason, maintain context, support decisions, and execute governed actions. Tool use and system changes stay within authorized permissions and required human approvals.
- Reason: Scope agent actions to approved tools, permissions and human approvals.

### AWS-09 — copy_edit
- Target: `aws-agentic-ai` / `aws-agentic-ai-workflow-automation`
- Exact source excerpt: Quadra designs coordinated agentic workflows where specialized agents work together across different tasks while retaining human approvals for high-risk, regulated, or business-critical decisions.
- Treatment: Quadra designs coordinated agentic workflows where specialized agents work together across different tasks while retaining human approvals for high-risk, regulated, or business-critical decisions. Tool use and system changes stay within authorized permissions and required human approvals.
- Reason: Scope agent actions to approved tools, permissions and human approvals.

### AWS-10 — copy_edit
- Target: `aws-agentic-ai` / `aws-agentic-ai-employee-engineering-productivity`
- Exact source excerpt: Quadra introduces AI-powered and agentic experiences across business and engineering workflows, helping employees access knowledge, analyze information, create business deliverables, initiate workflows, develop applications, test solutions, and automate repetitive activities.
- Treatment: Quadra introduces AI-powered and agentic experiences across business and engineering workflows, helping employees access knowledge, analyze information, create business deliverables, initiate workflows, develop applications, test solutions, and automate repetitive activities. Tool use and system changes stay within authorized permissions and required human approvals.
- Reason: Scope agent actions to approved tools, permissions and human approvals.

### AWS-11 — owner_verification
- Target: `aws` / `aws-capability-managed`
- Exact source excerpt: Always On. Always Optimizing.
- Treatment: Operate Reliably. Keep Optimizing.
- Reason: Removed unconditional always-on promise; operations coverage requires an agreed service scope.

### AWS-12 — owner_verification
- Target: `aws` / `aws-capability-managed`
- Exact source excerpt: Cloud environments require continuous monitoring, optimization, governance, and operational improvement. Quadra combines certified cloud expertise, intelligent automation, proactive operations, and AI-driven analysis to improve service reliability, security, performance, and cost efficiency.
- Treatment: Cloud environments require continuous monitoring, optimization, governance, and operational improvement. Quadra combines cloud expertise, intelligent automation, proactive operations, and AI-driven analysis to improve service reliability, security, performance, and cost efficiency.
- Reason: Certification status requires owner verification; retain Max-IT as the source service brand, not an owned software product.

### AWS-13 — owner_verification
- Target: `aws-managed`
- Exact source excerpt: Quadra combines 24x7 operations, certified cloud expertise, automation, Agentic AI, security, resilience, and cost management to help customers operate AWS environments reliably and efficiently.
- Treatment: Quadra combines cloud operations, cloud expertise, automation, Agentic AI, security, resilience, and cost management to help customers operate AWS environments reliably and efficiently. Monitoring, response, escalation and authorized actions are defined by the agreed service scope.
- Reason: Hold 24x7 and certified claims for owner verification; retain architecture-to-operations service intent without a universal SLA.

### AWS-14 — owner_verification
- Target: `aws-managed` / `aws-managed-cloudops`
- Exact source excerpt: Quadra provides continuous monitoring, incident response, patching, backup management, operational governance and automated remediation. Service levels and escalation procedures provide accountability for availability and response.
- Treatment: Quadra provides monitoring, incident response, patching, backup management, operational governance and approved automated remediation within the agreed service scope. Coverage, service levels, response targets and escalation procedures are agreed for the supported environment.
- Reason: Continuous service and SLA wording requires coverage, response and escalation terms; remediation must be authorized.

### AWS-15 — owner_verification
- Target: `aws-managed` / `aws-managed-secops`
- Exact source excerpt: Quadra delivers continuous security monitoring, risk prioritization, vulnerability management, incident coordination, compliance tracking, and remediation guidance.
- Treatment: Quadra delivers security monitoring within agreed coverage, risk prioritization, vulnerability management, incident coordination, compliance tracking, and remediation guidance.
- Reason: Do not imply universal continuous staffed service; coverage belongs in the service agreement.

### AWS-16 — owner_verification
- Target: `aws-managed` / `aws-managed-finops`
- Exact source excerpt: Quadra monitors cloud consumption, investigates unusual spending, identifies idle and oversized resources, evaluates commitment options and provides actionable monthly recommendations.
- Treatment: Quadra monitors cloud consumption, investigates unusual spending, identifies idle and oversized resources, evaluates commitment options and provides actionable recommendations at an agreed cadence.
- Reason: Confirm reporting cadence with the service owner rather than publishing a universal monthly commitment.

### AWS-17 — owner_verification
- Target: `aws-security` / `aws-security-threat-detection-response`
- Exact source excerpt: Quadra implements continuous monitoring and intelligent correlation to identify suspicious activity, connect related events, support investigations, and initiate approved response workflows.
- Treatment: Quadra implements continuous monitoring and intelligent correlation to identify suspicious activity, connect related events, support investigations, and initiate approved response workflows. Monitoring coverage and escalation responsibilities are agreed for the supported environment.
- Reason: Keep monitoring implementation distinct from an unqualified always-on managed response promise.

### AWS-18 — owner_verification
- Target: `aws-ai-use-cases`
- Exact source excerpt: Quadra helps organizations begin with proven AI patterns and adapt them to their processes, data, applications, controls, and operational requirements.
- Treatment: Explore nine proposed AI workflow opportunities. Quadra can adapt these patterns to customer processes, data, rules, applications, integrations, controls and operational requirements, with human review. Scope and suitability are assessed before implementation.
- Reason: Remove unsupported proven/readiness claim; clearly frame all nine as proposed, customer-specific opportunities, not shipped products.

### AWS-19 — heading_edit
- Target: `aws-ai-use-cases`
- Exact source excerpt: Ready-to-Deploy AI Solutions
- Treatment: AI Solutions for Business Workflows
- Reason: Readiness not independently established. Preserve all nine examples under a non-product, non-readiness heading.

### AWS-20 — heading_edit
- Target: `aws-ai-use-cases`
- Exact source excerpt: Accelerate Adoption with Business-Ready Use Cases
- Treatment: Accelerate Adoption with Business Workflow Opportunities
- Reason: Business-ready would imply validated deployment readiness; proposed opportunities preserve source ambition.

### AWS-21 — copy_edit
- Target: `aws-ai-use-cases` / `aws-ai-use-cases-merchant-onboarding`
- Exact source excerpt: Quadra automates repeatable onboarding activities while maintaining appropriate validation and human approval for exceptions and risk-sensitive decisions.
- Treatment: Quadra automates repeatable onboarding activities while maintaining appropriate validation and human approval for exceptions and risk-sensitive decisions. Connected tools and system updates operate only within authorized permissions and approval requirements.
- Reason: Make permission boundaries and approvals explicit for workflow actions.

### AWS-22 — copy_edit
- Target: `aws-ai-use-cases` / `aws-ai-use-cases-insurance-underwriting`
- Exact source excerpt: Quadra extracts and organizes information from submissions, supporting documents, and approved data sources to provide underwriters with a structured view for assessment.
- Treatment: Quadra extracts and organizes information from submissions, supporting documents, and approved data sources to provide underwriters with a structured view for assessment. The workflow supports human underwriters; eligibility, risk assessment and final decisions remain with authorized humans. It does not make autonomous eligibility or credit-scoring decisions.
- Reason: Protect consequential insurance and lending decisions: extraction and organization support human review, never automated approval or scoring.

### AWS-23 — copy_edit
- Target: `aws-ai-use-cases` / `aws-ai-use-cases-loan-underwriting`
- Exact source excerpt: Quadra extracts, organizes, validates, and summarizes applicant information for review while keeping final approval with authorized decision-makers.
- Treatment: Quadra extracts, organizes, validates, and summarizes applicant information for review while keeping final approval with authorized decision-makers. The workflow supports human underwriters; eligibility, risk assessment and final decisions remain with authorized humans. It does not make autonomous eligibility or credit-scoring decisions.
- Reason: Protect consequential insurance and lending decisions: extraction and organization support human review, never automated approval or scoring.

### AWS-24 — copy_edit
- Target: `aws-ai-use-cases` / `aws-ai-use-cases-employee-onboarding`
- Exact source excerpt: Quadra automates repeatable onboarding and access activities based on approved roles and policies while maintaining approvals and audit records.
- Treatment: Quadra automates repeatable onboarding and access activities based on approved roles and policies while maintaining approvals and audit records. Connected tools and system updates operate only within authorized permissions and approval requirements.
- Reason: Make permission boundaries and approvals explicit for workflow actions.

### AWS-25 — copy_edit
- Target: `aws-ai-use-cases` / `aws-ai-use-cases-work-automation`
- Exact source excerpt: Quadra introduces secure AI-powered work experiences that help employees use enterprise information, perform analysis, prepare content, and initiate approved workflows.
- Treatment: Quadra introduces secure AI-powered work experiences that help employees use enterprise information, perform analysis, prepare content, and initiate approved workflows. Connected tools and system updates operate only within authorized permissions and approval requirements.
- Reason: Make permission boundaries and approvals explicit for workflow actions.

### AWS-26 — editorial_convention
- Target: `aws`
- Exact source excerpt: Faster data center exits, reduced migration complexity, lower operational risk, and a secure AWS foundation ready for growth.
- Treatment: Outcomes to work toward: Faster data center exits, reduced migration complexity, lower operational risk, and a secure AWS foundation ready for growth.
- Reason: Apply the same outcome prefix to every overview and detail outcome statement. Outcomes remain source-faithful ambitions, not guarantees, customer proof or measured results.

### AWS-27 — owner_verification
- Target: `aws-managed` / `aws-managed-architecture-assessment`
- Exact source excerpt: Quadra uses an in-house assessment accelerator to evaluate cloud environments against architecture best practices across operations, security, reliability, performance, cost and sustainability.
- Treatment: Retained as an assessment method, without a new product name or ownership assertion.
- Reason: Confirm method availability and delivery scope with the service owner; do not recast as a separately owned software product.

### AWS-28 — owner_verification
- Target: `aws-managed`
- Exact source excerpt: Managed Services | Max-IT
- Treatment: Managed Services | Max-IT
- Reason: Retain the supplied service brand. Validate naming and service scope with its owner; no assumption of proprietary software or commercial product readiness.

## Complete heading coverage

| Source heading | Target | Status | Reason |
|---|---|---|---|
| AWS Cloud Transformation with Quadra | aws | preserved | Source heading and substantive treatment retained. |
| AWS Overview | aws | normalized | Retained as page eyebrow. |
| Blueprint for Your AWS Ecosystem | aws#aws-blueprint | preserved | Source heading and substantive treatment retained. |
| Modernize Faster. Operate Smarter. Secure Continuously. | aws | preserved | Retained as page subheading. |
| 4 AWS Competencies | aws | held_for_owner_verification | Preserved in issue AWS-02; omitted from public-facing draft copy. |
| 4 AWS Partner Programs | aws | held_for_owner_verification | Preserved in issue AWS-03; omitted from public-facing draft copy. |
| 120+ AWS Certifications | aws | held_for_owner_verification | Preserved in issue AWS-04; omitted from public-facing draft copy. |
| 1. Infra & Migration | aws#aws-capability-migration | preserved | Source heading and substantive treatment retained. |
| Accelerate Migration with Intelligent Automation | aws#aws-capability-migration | preserved | Capability promise retained in section body; always-on wording qualified where applicable. |
| Infra & Migration | aws-migration | preserved | Source heading and substantive treatment retained. |
| 1. Build a Secure and Governed Cloud Foundation | aws-migration#aws-migration-foundation | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 2. Accelerate Data Center and VMware Migration | aws-migration#aws-migration-datacenter-vmware | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 3. Strengthen Business Resilience with Backup and Disaster Recovery | aws-migration#aws-migration-backup-disaster-recovery | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 4. Migrate and Protect Mission-Critical SAP Workloads | aws-migration#aws-migration-sap | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 5. Modernize the Digital Workplace | aws-migration#aws-migration-digital-workplace | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 2. Application & Database Modernization | aws#aws-capability-apps | preserved | Source heading and substantive treatment retained. |
| Modernize Legacy Platforms for What Comes Next | aws#aws-capability-apps | preserved | Capability promise retained in section body; always-on wording qualified where applicable. |
| Application & Database Modernization | aws-apps | preserved | Source heading and substantive treatment retained. |
| 1. Modernize Applications for the Cloud-Native Era | aws-apps#aws-apps-cloud-native | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 2. Accelerate Legacy Application Transformation with AI | aws-apps#aws-apps-ai-legacy-transformation | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 3. Containerize Applications for Portability and Scale | aws-apps#aws-apps-containers | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 4. Modernize Databases for Agility and Performance | aws-apps#aws-apps-databases | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 5. Modernize Software Delivery with DevOps | aws-apps#aws-apps-devops | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 6. Accelerate Development with AI-Assisted Engineering | aws-apps#aws-apps-ai-engineering | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 7. Build Intelligent Applications | aws-apps#aws-apps-intelligent-applications | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 8. Evolve Applications Through Continuous Modernization | aws-apps#aws-apps-continuous-modernization | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| 3. Data Analytics & Machine Learning | aws#aws-capability-data-ai | preserved | Source heading and substantive treatment retained. |
| Turn Enterprise Data into Trusted Intelligence | aws#aws-capability-data-ai | preserved | Capability promise retained in section body; always-on wording qualified where applicable. |
| AWS Data Analytics & Machine Learning | aws-data-ai | preserved | Source heading and substantive treatment retained. |
| 1. Build a Modern Data Foundation | aws-data-ai#aws-data-ai-data-foundation | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 2. Modernize Data Integration and Processing | aws-data-ai#aws-data-ai-integration-processing | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 3. Transform Enterprise Data into Business Insights | aws-data-ai#aws-data-ai-business-insights | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 4. Unify Data Across the Enterprise | aws-data-ai#aws-data-ai-unified-data | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 5. Govern and Democratize Trusted Data | aws-data-ai#aws-data-ai-trusted-data-governance | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 6. Turn Data into Predictive Intelligence | aws-data-ai#aws-data-ai-predictive-intelligence | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 7. Operationalize Machine Learning at Scale | aws-data-ai#aws-data-ai-ml-operations | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 8. Continuously Optimize Data and ML Platforms | aws-data-ai#aws-data-ai-continuous-optimization | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 4. Agentic AI | aws#aws-capability-agentic-ai | preserved | Source heading and substantive treatment retained. |
| Move from AI Assistance to Intelligent Action | aws#aws-capability-agentic-ai | preserved | Capability promise retained in section body; always-on wording qualified where applicable. |
| Agentic AI | aws-agentic-ai | preserved | Source heading and substantive treatment retained. |
| From AI Assistance to Governed Business Action | aws-agentic-ai | preserved | Source heading and substantive treatment retained. |
| 1. Identify High-Value Agentic AI Opportunities | aws-agentic-ai#aws-agentic-ai-opportunities | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 2. Build Intelligent Agents Connected to Enterprise Knowledge and Systems | aws-agentic-ai#aws-agentic-ai-connected-agents | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| 3. Automate Complex Business Workflows with Agentic AI | aws-agentic-ai#aws-agentic-ai-workflow-automation | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| 4. Accelerate Employee Productivity and Software Engineering | aws-agentic-ai#aws-agentic-ai-employee-engineering-productivity | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| 5. Modernize Applications and Operationalize Agentic AI Securely | aws-agentic-ai#aws-agentic-ai-secure-operationalization | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 5. Managed Services \| Max-IT | aws#aws-capability-managed | preserved | Source heading and substantive treatment retained. |
| Always On. Always Optimizing. | aws#aws-capability-managed | adapted | Capability promise retained in section body; always-on wording qualified where applicable. |
| Managed Services \| Max-IT | aws-managed | preserved | Source heading and substantive treatment retained. |
| Intelligent Cloud Operations for Continuous Business Value | aws-managed | preserved | Source heading and substantive treatment retained. |
| CloudOps | aws-managed#aws-managed-cloudops | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| DevOps | aws-managed#aws-managed-devops | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| DevSecOps | aws-managed#aws-managed-devsecops | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| SecOps | aws-managed#aws-managed-secops | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| FinOps and Cost Optimization | aws-managed#aws-managed-finops | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| Intelligent FinOps Automation | aws-managed#aws-managed-finops-automation | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| AI-Powered Operations | aws-managed#aws-managed-ai-operations | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Automated Insights and Reporting | aws-managed#aws-managed-insights-reporting | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Automated Architecture Assessment | aws-managed#aws-managed-architecture-assessment | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Backup and Disaster Recovery | aws-managed#aws-managed-backup-disaster-recovery | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Strategic Advisory | aws-managed#aws-managed-strategic-advisory | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| 6. Security & Governance | aws#aws-capability-security | preserved | Source heading and substantive treatment retained. |
| Move from Reactive Protection to Continuous Risk Reduction | aws#aws-capability-security | preserved | Capability promise retained in section body; always-on wording qualified where applicable. |
| AWS Security & Governance | aws-security | preserved | Source heading and substantive treatment retained. |
| Confident Security and Compliance as You Scale | aws-security | preserved | Source heading and substantive treatment retained. |
| Establish a Governed Foundation | aws-security#aws-security-governed-foundation | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Architect for Defense in Depth | aws-security#aws-security-defense-in-depth | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Build Security into Software Delivery | aws-security#aws-security-secure-delivery | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Centralize Governance and Compliance | aws-security#aws-security-governance-compliance | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Prioritize Security Risk Across the Cloud Estate | aws-security#aws-security-risk-prioritization | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Detect and Respond to Threats Intelligently | aws-security#aws-security-threat-detection-response | adapted | Distinct problem, approach and outcome retained; targeted changes recorded in issues. |
| Protect Applications and Networks | aws-security#aws-security-applications-networks | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Modernize Identity and Zero Trust Access | aws-security#aws-security-identity-zero-trust | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Protect Data and Encryption Keys | aws-security#aws-security-data-encryption | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Secure AI Workloads | aws-security#aws-security-ai-workloads | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Protect the Software Supply Chain | aws-security#aws-security-software-supply-chain | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Apply Agentic AI to Security Operations | aws-security#aws-security-agentic-security-operations | preserved | Distinct source problem, approach and outcome retained without collapsing this section. |
| Ready-to-Deploy AI Solutions | aws-ai-use-cases | adapted | Renamed AI Solutions for Business Workflows; all nine examples retained, readiness claim held. |
| Accelerate Adoption with Business-Ready Use Cases | aws-ai-use-cases | adapted | Renamed to avoid unsupported business-ready claim. |
| Intelligent Document Processing | aws-ai-use-cases#aws-ai-use-cases-document-processing | preserved | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Turn Document-Heavy Processes into Intelligent Workflows | aws-ai-use-cases#aws-ai-use-cases-document-processing | preserved | Source subheading retained at the start of the section body. |
| AI-Powered Predictive Maintenance | aws-ai-use-cases#aws-ai-use-cases-predictive-maintenance | preserved | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Move from Reactive Maintenance to Proactive Operations | aws-ai-use-cases#aws-ai-use-cases-predictive-maintenance | preserved | Source subheading retained at the start of the section body. |
| Intelligent Inventory Management | aws-ai-use-cases#aws-ai-use-cases-inventory | preserved | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Improve Inventory Decisions with Data and AI | aws-ai-use-cases#aws-ai-use-cases-inventory | preserved | Source subheading retained at the start of the section body. |
| Merchant Onboarding Automation | aws-ai-use-cases#aws-ai-use-cases-merchant-onboarding | adapted | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Make Merchant Onboarding Faster and Simpler | aws-ai-use-cases#aws-ai-use-cases-merchant-onboarding | preserved | Source subheading retained at the start of the section body. |
| Insurance Underwriting Automation | aws-ai-use-cases#aws-ai-use-cases-insurance-underwriting | adapted | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Accelerate Underwriting with Intelligent Information Processing | aws-ai-use-cases#aws-ai-use-cases-insurance-underwriting | preserved | Source subheading retained at the start of the section body. |
| Loan Underwriting Automation | aws-ai-use-cases#aws-ai-use-cases-loan-underwriting | adapted | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Transform Manual Loan Evaluation into an AI-Assisted Process | aws-ai-use-cases#aws-ai-use-cases-loan-underwriting | preserved | Source subheading retained at the start of the section body. |
| Intelligent Exception Management | aws-ai-use-cases#aws-ai-use-cases-exception-management | preserved | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Turn Operational Exceptions into Faster Resolutions | aws-ai-use-cases#aws-ai-use-cases-exception-management | preserved | Source subheading retained at the start of the section body. |
| Employee Access and Onboarding Automation | aws-ai-use-cases#aws-ai-use-cases-employee-onboarding | adapted | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Simplify Employee Onboarding and Access Provisioning | aws-ai-use-cases#aws-ai-use-cases-employee-onboarding | preserved | Source subheading retained at the start of the section body. |
| AI-Powered Work Automation | aws-ai-use-cases#aws-ai-use-cases-work-automation | adapted | Proposed opportunity with distinct source problem, approach and non-guaranteed outcomes; human decision controls added where consequential. |
| Bring AI into Employees’ Everyday Work | aws-ai-use-cases#aws-ai-use-cases-work-automation | preserved | Source subheading retained at the start of the section body. |

## Validation
- Parsed JSON; verified eight unique page IDs, unique stable section IDs, required metadata, review stages, source attribution, parent hierarchy, and all card/related/CTA links against existing master plus the eight AWS IDs.
- Verified 58 detail mappings and six overview capability mappings. Each proposed use case has a separate section; no source detail section is dropped.
- Verified withheld counts, 24x7, always-on, ready-to-deploy and proven-pattern assertions are absent from page copy. Exact excerpts remain visible only in the review/issue ledger.
- Verified master content, navigation and supplied source text remain byte-unchanged, and DOCX hash matches source metadata.
- Parent owns merge and visual rendering; this hand-off does not claim preview/render validation.


## Final integration verification
The master and preview use these eight AWS pages. GCP is unchanged because the new attachment is byte-identical to the prior source. AIG v1.3 and its resolved decisions remain unchanged. Technical layout and menu checks are recorded in NOV01_UPDATE_QA.json and browser_qa.json. Human-underwriter wording was consolidated to one clear responsibility sentence.

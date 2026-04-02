"""
Seed script — Customer360 Data Mesh & Reltio MDM RAID Log
TPM perspective: SAP + Salesforce + Local Systems → Reltio MDM → Customer360
Datasets: Account, Contact, Address, Hierarchy
Run: python seed_customer360.py
"""

import httpx, random, string, time
from datetime import date, timedelta

BASE = "http://localhost:8080/api/raids/"
PROJECT = "Customer360 — Data Mesh & Reltio MDM"

def uid():
    ts = int(time.time() * 1000)
    rnd = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"RAID-{ts:X}-{rnd}"

def due(days_from_now: int) -> str:
    return (date.today() + timedelta(days=days_from_now)).isoformat()

def post(entry: dict):
    r = httpx.post(BASE, json=entry, timeout=10)
    r.raise_for_status()
    d = r.json()
    print(f"  [{d['type']}] {d['id']} — {d['title'][:70]}")
    time.sleep(0.05)  # avoid hammering

entries = []

# ═══════════════════════════════════════════════════════════════════════════════
# RISKS (R) — 20 entries   impact×likelihood → risk_score / risk_level / priority
# ═══════════════════════════════════════════════════════════════════════════════
risks = [
    # (title, description, impact, likelihood, urgency, status, owner, mitigation, due_offset)
    (
        "SAP Account Data Quality — Duplicate & Incomplete Master Records",
        "SAP customer master contains 15–20% duplicate accounts and fields like tax-id, industry, and parent-id are sparsely populated. Reltio survivorship will promote incomplete data into the Customer360 golden record, degrading data quality downstream.",
        4, 4, "High", "Open", "Data Quality Lead",
        "Conduct SAP data-quality profiling sprint; establish DQ thresholds before migration; block low-confidence records with quarantine queue.",
        30
    ),
    (
        "Reltio Survivorship Rules Overwrite Valid Salesforce Contact Attributes",
        "Survivorship is currently configured to prefer SAP as the system of record for all fields. SAP contact phone, email and job-title fields are often null, overwriting the richer Salesforce values in the golden record.",
        4, 4, "High", "Open", "Reltio Architect",
        "Redesign attribute-level survivorship by source trust score per field. Salesforce to win on contact attributes; SAP to win on financial/account identifiers.",
        21
    ),
    (
        "GDPR & CCPA Non-Compliance — PII Flowing Through Data Mesh Without Consent Tracking",
        "Contact PII (name, email, phone, address) is transmitted across data mesh domains without enforcing consent flags or masking for non-production environments, creating regulatory exposure across EU and California jurisdictions.",
        4, 3, "High", "Open", "Legal / Compliance Lead",
        "Implement consent metadata tags in data mesh pipeline; enforce PII masking in non-prod Reltio tenants; engage DPO for DPIA review.",
        45
    ),
    (
        "Missing Global Customer ID — Cross-System Entity Linkage Failure",
        "No single authoritative Global Customer ID exists across SAP, Salesforce and local systems. Without a common key, Reltio probabilistic matching is the only linkage mechanism, increasing false-positive merge risk for large enterprise accounts.",
        4, 4, "High", "Open", "Enterprise Architecture Lead",
        "Establish Global Customer ID as a first-class identifier in Reltio; publish ID mapping service; require all source systems to adopt GCID within 6 months.",
        60
    ),
    (
        "SAP Batch Extract Latency Incompatible with Real-Time Customer360 SLA",
        "SAP customer master data is only extracted in nightly batch (T+8h). Business requires Customer360 to reflect updates within 30 minutes of SAP change. Current architecture cannot meet this SLA.",
        3, 4, "High", "Open", "SAP Integration Lead",
        "Evaluate SAP Change Data Capture (CDC) via SLT or Debezium. Design event-driven pipeline to replace nightly batch for high-velocity account changes.",
        45
    ),
    (
        "Enterprise Account Hierarchy Missing Beyond 2 Levels in SAP",
        "SAP hierarchy extract only surfaces parent-child relationships up to 2 levels. Fortune-500 multi-national accounts have 4–6 levels of corporate hierarchy that are invisible in Customer360, breaking territory management and revenue roll-up.",
        4, 4, "High", "Open", "SAP Integration Lead",
        "Engage SAP Basis to expose recursive hierarchy via BAPI_CUSTOMER_GETLIST with hierarchy type configuration. Validate full hierarchy for top 500 accounts in QA.",
        30
    ),
    (
        "Reltio Entity Resolution False-Positive Merges for Large Enterprise Accounts",
        "Reltio match rules tuned for SMB are generating false-positive merges for enterprise accounts that have similar names (e.g., 'IBM Germany GmbH' merged with 'IBM Corporation'). This corrupts account hierarchies and revenue data.",
        4, 3, "High", "Open", "Reltio Architect",
        "Create enterprise-account rule set with higher confidence thresholds (>95%); add DUNS/Tax-ID as hard-block matching attribute; review top-500 enterprise accounts in UAT.",
        21
    ),
    (
        "Local Customer Entry Points Using Inconsistent Address Formats",
        "14 local systems feed customer address data using free-text fields with no standardisation (no postal code, mixed country formats, abbreviated street types). Address matching in Reltio is producing a 40% unmatch rate for addresses.",
        3, 4, "High", "In Progress", "Data Engineering Lead",
        "Implement address standardisation layer (SmartyStreets/Melissa) in the ingestion pipeline before Reltio load. Define canonical address schema and enforce at source API boundary.",
        30
    ),
    (
        "Data Mesh Domain Ownership Undefined — Governance Gaps for Account & Hierarchy Datasets",
        "No formal data product owner has been assigned for the Account or Hierarchy domains. Without ownership, schema changes, SLA breaches, and data quality issues will have no accountable team, increasing project risk.",
        3, 3, "High", "Open", "Data Governance Lead",
        "Formalise data product ownership in RACI; present to data governance council for ratification; include domain SLA commitments in programme charter.",
        45
    ),
    (
        "Reltio API Rate Limiting Causing Pipeline Bottlenecks During Bulk Operations",
        "Reltio SaaS enforces a 500 requests/second API limit. Initial account migration of 2.5M records and daily delta processing of 50K records are breaching this limit causing 429 errors and pipeline retries.",
        3, 3, "High", "Open", "Platform Engineering Lead",
        "Implement exponential back-off and retry logic; batch Reltio API calls to maximum payload size; negotiate higher rate limits with Reltio for migration window.",
        21
    ),
    (
        "Salesforce Custom Object Schema Changes Mid-Implementation Breaking Integration",
        "Salesforce admin team is not under a change freeze, risking custom object renames and field deletions that break the Salesforce → Data Mesh → Reltio pipeline without notice.",
        3, 2, "Medium", "Open", "Salesforce Admin",
        "Establish Salesforce change-freeze policy for objects in scope; implement schema contract tests in CI pipeline; alert on field-level changes via Salesforce metadata API.",
        60
    ),
    (
        "Reltio Tenant License Volume Exceeded by Actual Migration Data",
        "Current Reltio contract is licensed for 3M entity records. Pre-migration data assessment suggests up to 4.8M account + contact entities after deduplication. Contract over-run risk is material.",
        3, 2, "Medium", "Open", "PMO / Commercial Lead",
        "Commission precise entity count from data profiling; engage Reltio account team for volume-based pricing discussion; include buffer in business case.",
        60
    ),
    (
        "Network Bandwidth Insufficient for High-Volume SAP Delta Loads to Cloud Data Mesh",
        "On-premises SAP system is connected to the cloud data mesh platform via a shared MPLS link (100 Mbps). Full historical load of 2.5M account records (est. 8 GB) will saturate the link during business hours.",
        2, 3, "Medium", "Open", "Platform Engineering Lead",
        "Schedule full loads in off-peak maintenance windows; evaluate Direct Connect / ExpressRoute uplift; compress payloads with GZIP before transfer.",
        45
    ),
    (
        "Change Management — Business Resistance to Customer360 Golden Record as System of Truth",
        "Sales and finance teams are accustomed to querying SAP and Salesforce directly. Adoption of Customer360 as the authoritative source requires behaviour change that is not supported by a formal change management programme.",
        2, 3, "Medium", "Open", "PMO Lead",
        "Develop change management plan with executive sponsorship; deliver targeted training by persona (Sales, Finance, Ops); track adoption via API consumption metrics.",
        90
    ),
    (
        "International Address Validation Not Supported — APAC & EMEA Addresses Failing",
        "The selected address validation vendor only supports US and Canada formats. 30% of the enterprise customer base is APAC/EMEA and will bypass validation, causing uncleansed address data in Customer360.",
        3, 4, "High", "Open", "Data Quality Lead",
        "Evaluate international-capable vendor (Loqate / Melissa Global); assess cost impact; implement region-aware validation routing in the address standardisation layer.",
        30
    ),
    (
        "Data Steward Capacity Insufficient to Support Match/Merge Review Queue",
        "Reltio manual review queue is projected at 5,000–10,000 records per week during hypercare. Only 2 data stewards are allocated, creating a backlog that degrades Customer360 accuracy.",
        3, 3, "High", "Open", "Data Governance Lead",
        "Define escalation thresholds to reduce manual review load; auto-approve above 95% confidence; scale steward capacity to 6 FTE during hypercare; target 48h SLA for review.",
        30
    ),
    (
        "B2B vs B2C Entity Misclassification in Reltio Due to Source System Inconsistency",
        "SAP classifies SMBs as 'Kunnr' (commercial) while local systems tag them as individual customers. Reltio is inheriting these inconsistencies, misclassifying 8% of entities and applying wrong survivorship rules.",
        3, 3, "High", "Open", "Reltio Architect",
        "Define classification taxonomy and apply source-system trust scoring at entity type level; implement classification validation rule in ingestion pipeline; quarantine ambiguous records.",
        45
    ),
    (
        "Platform Outage Risk — Reltio SaaS Single-Region Deployment",
        "The Reltio tenant is deployed in a single AWS region with no DR failover configured. Any regional outage would make Customer360 unavailable, impacting all downstream CRM, ERP and analytics consumers.",
        4, 2, "Medium", "Open", "Platform Engineering Lead",
        "Review Reltio DR SLA contractually; request multi-region read replica configuration; design downstream consumer fallback to cached golden record snapshot.",
        90
    ),
    (
        "Salesforce Contact Ownership Model Incompatible with Reltio Account-Contact Relationship",
        "Salesforce contacts are owned by individual sales reps and can be private. Reltio requires all contacts to be linked to an account entity. Private / unlinked contacts in Salesforce will fail Reltio validation on load.",
        3, 3, "Medium", "Open", "Salesforce Admin",
        "Pre-migration cleanup: assign all orphan contacts to a default account; enforce account-contact relationship rule in Salesforce validation; align data models before migration.",
        45
    ),
    (
        "Data Lineage Gaps — Address Transformations Not Captured in Data Catalog",
        "Address standardisation transformations applied in the data mesh pipeline are not recorded in the enterprise data catalog. Auditors and data stewards cannot trace how an address in Customer360 was derived from source.",
        2, 4, "Low", "Open", "Data Engineering Lead",
        "Implement OpenLineage event emission from address standardisation job; register datasets and transformations in Collibra/Atlan; validate lineage graph in QA before go-live.",
        60
    ),
]

print(f"\n{'='*60}")
print(f"  Seeding RISKS (R) — {len(risks)} entries")
print(f"{'='*60}")
for r in risks:
    title, desc, impact, likelihood, urgency, status, owner, mitigation, due_d = r
    score = impact * likelihood
    level = ("Intolerable" if score >= 13 else "Substantial" if score >= 9 else "Moderate" if score >= 5 else "Tolerable")
    priority = "High" if level in ("Intolerable", "Substantial") else ("Medium" if level == "Moderate" else "Low")
    post({
        "type": "R",
        "title": title, "description": desc,
        "status": status, "priority": priority, "urgency": urgency,
        "owner": owner, "mitigation": mitigation,
        "due_date": due(due_d), "project": PROJECT,
        "impact": impact, "likelihood": likelihood,
        "risk_score": score, "risk_level": level,
    })

# ═══════════════════════════════════════════════════════════════════════════════
# ASSUMPTIONS (A) — 15 entries
# ═══════════════════════════════════════════════════════════════════════════════
assumptions = [
    # (title, description, priority, urgency, status, owner, mitigation, due_offset)
    (
        "SAP Is System of Record for Account Hierarchy & Financial Attributes",
        "It is assumed that SAP holds the authoritative account hierarchy, credit limit, payment terms and tax identifiers. All downstream domains will inherit these attributes from Customer360 via Reltio.",
        "High", "High", "Open", "Enterprise Architecture Lead",
        "Validate with SAP functional team and Finance; document formally in data product spec; confirm in data governance council.",
        30
    ),
    (
        "Salesforce Is System of Record for Contact Attributes (Phone, Email, Title)",
        "Contact information (phone, email, job title) maintained by the sales team in Salesforce is assumed to be more accurate than SAP. Reltio survivorship will defer to Salesforce for contact-level fields.",
        "High", "High", "Open", "Reltio Architect",
        "Validate with data quality profiling comparing SAP vs Salesforce completeness scores for contact fields; formalise in survivorship design document.",
        21
    ),
    (
        "Reltio Auto-Match Will Achieve 85%+ Match Rate Without Manual Review",
        "The entity resolution model will achieve an 85%+ automated match rate, keeping manual review queue manageable. If match rate falls below this, steward capacity and go-live timeline will be impacted.",
        "High", "High", "Open", "Reltio Architect",
        "Validate assumption during QA using representative data sample; adjust confidence thresholds; escalate to PMO if match rate below 80% at end of QA cycle.",
        30
    ),
    (
        "All Source Systems Will Adopt the Global Customer ID Within Programme Timeline",
        "SAP, Salesforce and all 14 local systems will implement the Global Customer ID as a mandatory field within the programme timeline, enabling deterministic cross-system entity linkage in Reltio.",
        "High", "High", "Open", "Enterprise Architecture Lead",
        "Confirm GCID adoption roadmap with each system owner; include contractual SLA in integration agreement; flag as programme blocker if any system cannot comply.",
        60
    ),
    (
        "SAP RFC / BAPI Interfaces Are Available and Authorised for Data Extraction",
        "SAP Basis will configure RFC destinations and authorise the integration user for read access to customer master (KNA1, KNB1, KNVV) and hierarchy tables without custom development.",
        "High", "High", "Open", "SAP Integration Lead",
        "Validate with SAP Basis in Sprint 1; if custom BAPIs required, raise change request and adjust timeline accordingly.",
        14
    ),
    (
        "Salesforce Schema Will Not Undergo Breaking Changes During the 9-Month Implementation",
        "The Salesforce org will be under an informal change freeze for objects in scope (Account, Contact, Address). No field renames, type changes, or custom object deletions are expected.",
        "High", "Medium", "Open", "Salesforce Admin",
        "Issue formal change freeze request to Salesforce admin; implement schema-contract tests in CI pipeline to detect breaking changes automatically.",
        21
    ),
    (
        "Business Stakeholders Will Commit 20% Capacity to UAT and Data Quality Sign-Off",
        "Data stewards and business SMEs from Finance, Sales and Operations will be available for UAT validation, data quality reviews and formal sign-off at programme milestones.",
        "High", "High", "Open", "PMO Lead",
        "Secure stakeholder commitment via executive sponsor; include UAT participation in project charter; track attendance at UAT sessions.",
        45
    ),
    (
        "Address Validation Vendor Contract Will Be Finalised Before Address Standardisation Build",
        "Procurement will complete contract negotiation with the address validation vendor (SmartyStreets / Loqate) before the address standardisation pipeline build begins, avoiding build-rework.",
        "Medium", "High", "Open", "PMO / Commercial Lead",
        "Track vendor contract as programme dependency; initiate procurement process immediately; identify fallback open-source library if contract delays arise.",
        21
    ),
    (
        "Data Mesh Platform (Cloud) Will Meet 99.9% Uptime SLA During Go-Live",
        "The cloud data mesh platform will maintain 99.9% availability during go-live and hypercare. Any downtime will trigger automatic failover without manual intervention.",
        "Medium", "Medium", "Open", "Platform Engineering Lead",
        "Validate SLA contractually; implement synthetic monitoring; design graceful degradation mode for downstream consumers during mesh outage.",
        60
    ),
    (
        "Customer360 Golden Record Will Be the Authoritative Source for All Downstream Analytics",
        "Once live, all BI, analytics and reporting tools (Tableau, Power BI, Databricks) will consume customer data exclusively from Customer360 via Reltio API, retiring direct queries to SAP and Salesforce.",
        "High", "Medium", "Open", "Data Governance Lead",
        "Confirm decommission plan for direct source-system queries; align with analytics team; include in data governance policy and enforce via access controls.",
        90
    ),
    (
        "Data Governance Policies (Retention, Consent, Cross-Border Transfer) Approved Before Phase 1",
        "Legal and compliance will approve all data governance policies — including GDPR retention schedules, consent management, and cross-border data transfer clauses — before Phase 1 go-live.",
        "High", "High", "In Progress", "Legal / Compliance Lead",
        "Track policy approval as hard gate in programme plan; escalate to executive sponsor if approval is delayed more than 2 weeks.",
        45
    ),
    (
        "Local Systems Will Expose Customer Data via Standard REST API for Mesh Ingestion",
        "All 14 local customer entry point systems will expose a standardised REST API endpoint for customer data ingestion into the data mesh, eliminating the need for file-based extraction.",
        "Medium", "Medium", "Open", "Data Engineering Lead",
        "Conduct system-by-system API capability assessment in discovery sprint; for systems without API capability, design file-based fallback with transformation layer.",
        30
    ),
    (
        "Reltio Professional Services Will Deliver Initial Entity Resolution Model in 6 Weeks",
        "Reltio PS engagement (SOW agreed) will deliver a functional entity resolution model, survivorship rules and initial match configuration within a 6-week engagement period.",
        "High", "High", "Open", "Reltio Architect",
        "Track PS deliverables weekly against SOW milestones; escalate to Reltio account team if PS is behind schedule; identify internal capability to bridge gap if needed.",
        42
    ),
    (
        "Single Canonical Address Schema Will Be Adopted Across All Domains",
        "All domains (Account, Contact, Hierarchy) will adopt a single canonical address schema (ISO 19160) to enable consistent address matching and validation across the data mesh.",
        "Medium", "Medium", "Open", "Data Governance Lead",
        "Publish canonical address schema in data catalog; conduct schema review with all domain teams; enforce via data mesh contract schema registry.",
        30
    ),
    (
        "Data Mesh Domain Teams Will Self-Serve Customer360 Data Post Go-Live",
        "After go-live, domain teams (Sales Ops, Finance, Marketing) will self-serve customer data from Customer360 via published data products without requiring central data engineering support.",
        "Medium", "Low", "Open", "PMO Lead",
        "Deliver self-service training programme; publish data product API documentation; establish support runbook; monitor API adoption via usage dashboards.",
        90
    ),
]

print(f"\n{'='*60}")
print(f"  Seeding ASSUMPTIONS (A) — {len(assumptions)} entries")
print(f"{'='*60}")
for a in assumptions:
    title, desc, priority, urgency, status, owner, mitigation, due_d = a
    post({
        "type": "A",
        "title": title, "description": desc,
        "status": status, "priority": priority, "urgency": urgency,
        "owner": owner, "mitigation": mitigation,
        "due_date": due(due_d), "project": PROJECT,
    })

# ═══════════════════════════════════════════════════════════════════════════════
# ISSUES (I) — 20 entries
# ═══════════════════════════════════════════════════════════════════════════════
issues = [
    # (title, description, priority, urgency, status, owner, mitigation, due_offset)
    (
        "SAP Extract Failing for Accounts With Special Characters in Name/Address Fields",
        "RFC extraction job crashes when SAP account name or address fields contain special characters (ü, ñ, &, <, >). Affects ~12,000 records. These accounts are completely absent from Reltio Customer360.",
        "High", "High", "Open", "SAP Integration Lead",
        "Encode all SAP string fields as UTF-8 before extraction; add character sanitisation step in ingestion pipeline; re-extract and reload affected 12,000 records.",
        14
    ),
    (
        "Reltio Survivorship Overwriting Salesforce Contact Phone with SAP Null Values",
        "Current survivorship rule prefers SAP for all contact fields. SAP phone numbers are null for 35% of contacts, causing Reltio to write null into Customer360 phone, overwriting valid Salesforce data.",
        "High", "High", "In Progress", "Reltio Architect",
        "Update survivorship to use attribute-level source trust: Salesforce wins on phone, email and title where SAP value is null. Reprocess all affected contact records.",
        7
    ),
    (
        "Orphan Contact Records — Local System Contacts Not Linked to Account in Reltio",
        "Local systems submit contact records without an account reference. Reltio has no account to link them to, creating 28,000+ orphan contact entities in Customer360 that are invisible to account-level queries.",
        "High", "High", "Open", "Data Engineering Lead",
        "Implement probabilistic account linkage using contact email domain matching; quarantine unmatched contacts for steward review; enforce account-id as mandatory field at local system API boundary.",
        21
    ),
    (
        "Account Hierarchy Showing Flat Structure for Multi-Site Enterprise Accounts in Customer360",
        "Enterprise accounts with multiple subsidiaries are displayed as flat lists in Customer360. The parent-child-grandchild hierarchy from SAP is not being propagated through the data mesh pipeline, breaking territory assignment and revenue roll-up.",
        "High", "Medium", "In Progress", "SAP Integration Lead",
        "Fix hierarchy extraction to capture recursive HKUNNR relationships; load hierarchy as Reltio relationship entity type; validate top-50 enterprise accounts in QA.",
        21
    ),
    (
        "Pipeline Latency Breach — Account Updates Taking 7 Hours vs 4-Hour SLA",
        "The account update pipeline from SAP → Data Mesh → Reltio is averaging 7 hours end-to-end, against a 4-hour business SLA. Root cause: sequential processing and no parallelism in the transformation layer.",
        "High", "High", "Open", "Data Engineering Lead",
        "Refactor pipeline to parallel processing using Spark partitioning; introduce micro-batching for SAP delta extracts; target ≤2h E2E latency after refactor.",
        14
    ),
    (
        "Match Confidence Threshold Causing False-Positive Merges for Fortune-500 Subsidiaries",
        "Reltio match confidence threshold is set at 72%, causing 'IBM Germany GmbH' to merge with 'IBM Corporation' and 'Siemens AG' with 'Siemens Healthcare GmbH'. 47 confirmed false merges identified in QA.",
        "High", "High", "In Progress", "Reltio Architect",
        "Raise enterprise account threshold to 94%; add DUNS number as hard-block matching attribute; unmerge affected 47 records; re-run QA regression suite.",
        7
    ),
    (
        "UAT Reltio Tenant Missing Survivorship Rules Configured in Production",
        "UAT Reltio environment does not have the same survivorship configuration as production. UAT results are unreliable — test pass in UAT, fail in production on go-live, creating hidden risk.",
        "High", "High", "Open", "Reltio Architect",
        "Synchronise Reltio configuration between environments using Reltio config-as-code export/import; add environment parity check to go-live checklist.",
        7
    ),
    (
        "12,000+ Duplicate Contacts in Salesforce Not Resolved Before Migration to Reltio",
        "Salesforce contains 12,500 identified duplicate contacts (same email, different records). Migration without pre-deduplication will load all duplicates into Reltio, bloating the entity count and degrading match quality.",
        "High", "High", "Open", "Salesforce Admin",
        "Run Salesforce native duplicate management to auto-merge confirmed duplicates; present borderline duplicates to data stewards; complete deduplication before migration cut-over.",
        21
    ),
    (
        "Reltio Bulk API Performance Degrading at Scale — 1M Account Load Taking 18+ Hours",
        "Loading 1M account records via Reltio Bulk API is taking 18+ hours, well beyond the 6-hour migration window. Throughput degrades significantly above 500K records due to index rebuilding.",
        "High", "High", "Open", "Platform Engineering Lead",
        "Work with Reltio PS to optimise bulk load configuration (disable non-essential indexing during load); shard load into 250K batches; schedule during agreed maintenance window.",
        14
    ),
    (
        "SAP 3rd and 4th Level Account Hierarchy Relationships Missing From Extract",
        "The BAPI_CUSTOMER_GETLIST call is only returning direct parent relationships (1 level). Grandparent and great-grandparent relationships are absent. Affects 340 enterprise accounts with deep corporate structures.",
        "High", "High", "Open", "SAP Integration Lead",
        "Re-implement hierarchy extract using recursive CDS view on KNVH table; validate output against SAP transaction VD03 for 340 affected accounts.",
        14
    ),
    (
        "Cross-BU Account Hierarchy Misalignment — SAP and Salesforce Disagree on Parent Account",
        "For 120 enterprise accounts, the parent account defined in SAP differs from the parent account in Salesforce (e.g., due to regional business unit ownership disputes). Reltio is inheriting the conflict and creating split hierarchies.",
        "High", "High", "Open", "Data Governance Lead",
        "Escalate hierarchy ownership disputes to data governance council; define rule: SAP wins for financial hierarchy, Salesforce for commercial hierarchy; encode as separate relationship types in Reltio.",
        30
    ),
    (
        "Reltio API Returning Stale Cached Data — 15-Minute Cache Lag on Account Lookups",
        "Reltio read API is returning stale golden record data with up to 15 minutes of cache lag. Downstream CRM and ERP systems refreshing customer data are reading outdated account status and address values.",
        "Medium", "Medium", "In Progress", "Platform Engineering Lead",
        "Configure Reltio cache TTL to ≤60 seconds for account and contact entity types; evaluate ETag-based conditional GET for high-frequency consumers; discuss cache config with Reltio support.",
        14
    ),
    (
        "Address Validation Vendor Only Supporting US/Canada — APAC & EMEA Addresses Uncleansed",
        "SmartyStreets integration is live for US/CA addresses but does not support APAC or EMEA address formats. 38% of enterprise customer addresses are international and are passing through to Reltio uncleansed.",
        "Medium", "Medium", "Open", "Data Quality Lead",
        "Evaluate Loqate or Google Address Validation API for international coverage; implement fallback routing by country code; prioritise top-10 APAC/EMEA countries first.",
        30
    ),
    (
        "Data Lineage Not Captured for Address Transformations in Mesh Pipeline",
        "The address standardisation and validation transformations applied in the data mesh ingestion pipeline are not emitting lineage events. Auditors cannot trace how Customer360 address data was derived from source systems.",
        "Medium", "Low", "Open", "Data Engineering Lead",
        "Implement OpenLineage events in address transformation jobs; register lineage in enterprise data catalog (Collibra); validate lineage graph completeness before go-live.",
        45
    ),
    (
        "Salesforce Account-Contact Relationship Missing for 8,000 Contacts",
        "8,000 Salesforce contacts have no account lookup populated (created as leads, converted without account assignment). These fail Reltio's mandatory account-contact relationship validation and are rejected on load.",
        "High", "High", "Open", "Salesforce Admin",
        "Assign orphan contacts to default account placeholder pending steward review; enforce account lookup as required field in Salesforce validation rule; complete remediation before migration.",
        14
    ),
    (
        "Local System Customer IDs Not Included in Salesforce Export Causing Linkage Failure",
        "Local ERP and POS systems use their own customer identifiers which are not stored in Salesforce. Without these IDs in the Salesforce export, Reltio cannot link local system records to Salesforce contacts, creating duplicate entities.",
        "High", "High", "Open", "Data Engineering Lead",
        "Build ID cross-reference table mapping local system IDs to Salesforce contact IDs; load cross-reference into Reltio as source system identifiers; validate linkage rate in QA.",
        21
    ),
    (
        "Reltio Entity Type Mapping Incorrect — SMBs Classified as Individual Customers",
        "SMB accounts from local systems are being mapped to the 'Individual' entity type in Reltio instead of 'Organisation', causing wrong survivorship rules to apply and excluding them from account-level aggregations.",
        "High", "High", "Open", "Reltio Architect",
        "Fix entity type classification logic in ingestion pipeline using business type code from source; reclassify all 15,000 affected SMB records in Reltio; rerun survivorship for impacted entities.",
        14
    ),
    (
        "Performance Degradation on Reltio Relationship API for Hierarchy-Heavy Accounts",
        "Querying account hierarchy relationships for enterprise accounts with 200+ child entities via Reltio REST API is timing out (>30 second response). CRM UI is displaying blank hierarchy trees for these accounts.",
        "High", "High", "In Progress", "Platform Engineering Lead",
        "Implement hierarchy pre-computation job that materialises flattened hierarchy into a separate read-optimised dataset; cache hierarchy snapshots; investigate Reltio GraphQL API as alternative.",
        14
    ),
    (
        "Non-Prod Reltio Tenant PII Data — Production Data Copied to UAT Without Masking",
        "Production customer PII (name, email, phone, address) was copied to the UAT Reltio tenant without data masking. This violates GDPR Article 25 (data protection by design) and internal data classification policy.",
        "High", "High", "Resolved", "Legal / Compliance Lead",
        "Immediately purge production PII from UAT tenant; implement synthetic data generation for UAT; enforce data masking pipeline as mandatory step in any prod-to-non-prod data movement.",
        7
    ),
    (
        "Account Status Mismatch — SAP Active Accounts Showing as Inactive in Salesforce",
        "210 accounts are flagged as 'Active' in SAP but 'Inactive' in Salesforce due to a historical migration issue. Reltio survivorship is applying SAP account status, incorrectly activating inactive accounts in Customer360.",
        "Medium", "Medium", "Open", "Data Quality Lead",
        "Audit 210 discrepant accounts with Finance and Sales to determine correct status; apply manual override in Reltio; define account status as a governed attribute requiring dual-source agreement to change.",
        21
    ),
]

print(f"\n{'='*60}")
print(f"  Seeding ISSUES (I) — {len(issues)} entries")
print(f"{'='*60}")
for i in issues:
    title, desc, priority, urgency, status, owner, mitigation, due_d = i
    post({
        "type": "I",
        "title": title, "description": desc,
        "status": status, "priority": priority, "urgency": urgency,
        "owner": owner, "mitigation": mitigation,
        "due_date": due(due_d), "project": PROJECT,
    })

# ═══════════════════════════════════════════════════════════════════════════════
# DEPENDENCIES (D) — 15 entries
# ═══════════════════════════════════════════════════════════════════════════════
dependencies = [
    # (title, description, priority, urgency, status, owner, mitigation, due_offset)
    (
        "SAP Basis — RFC Connection Configuration & Integration User Authorisation",
        "SAP Basis team must configure RFC destinations to the cloud data mesh and authorise the integration service account with read access to KNA1, KNB1, KNVV, KNVH and related customer master tables. Without this, no data can be extracted from SAP.",
        "High", "High", "Open", "SAP Integration Lead",
        "Raise SAP Basis change request immediately; include RFC config in Sprint 1 acceptance criteria; escalate to CIO if not completed by Sprint 1 end.",
        14
    ),
    (
        "Salesforce — Connected App Creation & OAuth 2.0 Credentials for API Access",
        "Salesforce admin must create a Connected App with appropriate scopes (Account, Contact, Address read; Bulk API access) and provide OAuth 2.0 client credentials for the data mesh integration pipeline.",
        "High", "High", "Resolved", "Salesforce Admin",
        "Completed. OAuth credentials stored in secrets manager. Validate token refresh cycle in staging environment.",
        7
    ),
    (
        "Reltio Professional Services — Entity Resolution Model & Survivorship Rules Delivery",
        "Reltio PS engagement (SOW signed) must deliver: (1) entity resolution model for Account, Contact, Address; (2) survivorship rules by source trust; (3) match tuning on representative data sample. Critical path for QA start.",
        "High", "High", "In Progress", "Reltio Architect",
        "Weekly PS delivery review against SOW milestones; escalate to Reltio account team if behind schedule; identify internal capacity to supplement if required.",
        42
    ),
    (
        "Enterprise Data Governance Council — Canonical Customer360 Data Model Approval",
        "The data governance council must formally approve the canonical Customer360 data model (entities, attributes, domains, SOR assignments) before implementation begins. Lack of approval blocks development of pipelines and survivorship rules.",
        "High", "High", "Open", "Data Governance Lead",
        "Schedule governance council session; present data model with SOR matrix; require formal sign-off document; track as programme gate 1.",
        21
    ),
    (
        "Network & Infrastructure — Dedicated Connectivity Between On-Prem SAP and Cloud Data Mesh",
        "Network team must provision a dedicated high-bandwidth connection (AWS Direct Connect / Azure ExpressRoute) between the on-premises SAP data centre and the cloud data mesh platform to support migration and ongoing delta loads.",
        "High", "High", "In Progress", "Platform Engineering Lead",
        "Network team has raised procurement request. Target provisioning in 3 weeks. Interim solution: scheduled off-peak MPLS transfers during build phase.",
        21
    ),
    (
        "Address Validation Vendor — Contract Finalisation & API Key Provisioning",
        "Procurement must finalise contract with address validation vendor (Loqate preferred for international coverage) and provision API keys before address standardisation pipeline build starts. Contract negotiation is ongoing.",
        "Medium", "High", "Open", "PMO / Commercial Lead",
        "Track contract timeline weekly with procurement; identify open-source fallback (libpostal) for address parsing if contract exceeds 4-week delay.",
        21
    ),
    (
        "Business Units — Data Steward Nominations for Account, Contact & Address Domains",
        "Business unit heads must nominate trained data stewards for each Customer360 domain (Account, Contact, Address, Hierarchy) before UAT begins. Stewards are required to validate match/merge decisions and sign off data quality.",
        "High", "High", "Open", "Data Governance Lead",
        "Send formal nomination request to BU heads via executive sponsor; include steward role description and time commitment; track nominations in programme RACI.",
        30
    ),
    (
        "Legal & Compliance — Data Retention, Consent & Cross-Border Transfer Policy Sign-Off",
        "Legal must approve: (1) Customer360 data retention schedule by entity type; (2) consent management approach for contact data; (3) cross-border data transfer clauses for APAC/EMEA entities stored in US cloud region.",
        "High", "High", "Open", "Legal / Compliance Lead",
        "Share policy drafts with Legal immediately; schedule review sessions weekly; track as hard go-live gate — no Phase 1 launch without sign-off.",
        45
    ),
    (
        "Cloud Platform Team — Reltio Production Tenant Provisioning & Data Mesh Namespace Config",
        "Cloud platform team must provision the Reltio production tenant, configure data mesh namespace, set up IAM roles for pipeline service accounts, and validate connectivity before QA begins.",
        "High", "High", "Resolved", "Platform Engineering Lead",
        "Completed. Production tenant provisioned. IAM roles and namespace configured. Connectivity validated from data mesh pipeline.",
        0
    ),
    (
        "Identity & Access Management — SSO Integration for Reltio User Authentication",
        "The identity team must configure SAML 2.0 SSO between the corporate identity provider (Azure AD / Okta) and Reltio for user authentication and role-based access control before UAT onboarding.",
        "Medium", "Medium", "In Progress", "Platform Engineering Lead",
        "IAM team has SAML metadata exchange in progress. Target completion end of this sprint. Validate RBAC roles for: Admin, Data Steward, Read-Only consumer.",
        14
    ),
    (
        "Analytics & BI Team — Customer360 Golden Record Consumption Pattern Sign-Off",
        "BI and Analytics team must confirm how they will consume Customer360 data (Reltio API vs direct DB read vs data mesh published dataset) and validate the golden record schema meets their reporting requirements before go-live.",
        "Medium", "Medium", "Open", "Data Engineering Lead",
        "Schedule workshop with Analytics team; present Reltio API and data mesh consumption options; agree on SLA for golden record availability for analytics workloads.",
        30
    ),
    (
        "PMO / Change Management — Training & Comms Programme for Downstream Consumers",
        "PMO must deliver change management programme including: (1) stakeholder comms plan; (2) role-based training for Sales, Finance, Ops teams; (3) go-live hypercare support model before Phase 1 launch.",
        "Medium", "High", "Open", "PMO Lead",
        "Assign change manager; build stakeholder map; design training curriculum by persona; schedule training sessions 4 weeks before go-live.",
        60
    ),
    (
        "Data Engineering — GCID (Global Customer ID) Cross-Reference Table Build",
        "Data engineering must build and maintain a cross-reference table mapping all local system customer IDs, SAP Kunnr, Salesforce Account IDs and Contact IDs to the Global Customer ID. This table is foundational to deterministic entity linking in Reltio.",
        "High", "High", "Open", "Data Engineering Lead",
        "Design cross-reference schema; load from all source systems; publish as data mesh data product; validate completeness and refresh frequency.",
        21
    ),
    (
        "Finance — Reltio Volume-Based License Uplift Approval",
        "Finance must approve the budget for a Reltio licence volume uplift (from 3M to 5M entities) based on revised migration entity count. Without approval, the contract cannot be amended and go-live is blocked.",
        "High", "High", "Open", "PMO / Commercial Lead",
        "Present revised entity count and cost impact to Finance Director; include in programme business case reforecast; obtain written approval before contract amendment is signed.",
        30
    ),
    (
        "Local Systems Team — REST API Exposure for Data Mesh Ingestion",
        "14 local customer entry point systems (POS, Regional ERP, Web Portals) must expose standardised REST APIs to enable data mesh ingestion. Systems without API capability require file-based extraction as fallback.",
        "High", "High", "Open", "Data Engineering Lead",
        "Conduct API capability assessment across all 14 systems; define API contract standard; for systems without API, design and build file-based extraction pipeline with transformation layer.",
        45
    ),
]

print(f"\n{'='*60}")
print(f"  Seeding DEPENDENCIES (D) — {len(dependencies)} entries")
print(f"{'='*60}")
for d in dependencies:
    title, desc, priority, urgency, status, owner, mitigation, due_d = d
    post({
        "type": "D",
        "title": title, "description": desc,
        "status": status, "priority": priority, "urgency": urgency,
        "owner": owner, "mitigation": mitigation,
        "due_date": due(due_d), "project": PROJECT,
    })

total = len(risks) + len(assumptions) + len(issues) + len(dependencies)
print(f"\n{'='*60}")
print(f"  SEED COMPLETE — {total} entries loaded into proj-tech-debt / PM.raid_entries")
print(f"  R:{len(risks)}  A:{len(assumptions)}  I:{len(issues)}  D:{len(dependencies)}")
print(f"{'='*60}\n")

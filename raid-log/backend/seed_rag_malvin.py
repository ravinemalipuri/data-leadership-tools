"""
Seed: RAG Implementation on Malvin Platform (Local & Cloud PoC)
Role: Lead Engineer & Data Architect
Run:  python seed_rag_malvin.py
Prereq: backend running on localhost:8080, login with tpm/tpm2024
"""
import requests, sys

BASE = "http://localhost:8080"
PROJECT = "RAG PoC — Malvin Platform (Local & Cloud)"

# ── Auth ──────────────────────────────────────────────────────────────────────
def get_token():
    r = requests.post(f"{BASE}/api/auth/token",
                      data={"username": "tpm", "password": "tpm2024"})
    r.raise_for_status()
    return r.json()["access_token"]

def post(token, payload):
    r = requests.post(f"{BASE}/api/raids/",
                      json=payload,
                      headers={"Authorization": f"Bearer {token}"})
    if r.status_code not in (200, 201):
        print(f"  ERROR {r.status_code}: {r.text[:120]}")
    else:
        print(f"  Created {r.json()['id']}: {payload['title'][:60]}")
    return r

# ─────────────────────────────────────────────────────────────────────────────
ENTRIES = [

# ══════════════════════════════════════════════════════════════
# RISKS
# ══════════════════════════════════════════════════════════════
{"type":"R","impact":4,"likelihood":4,"status":"Open","priority":"High","urgency":"High","owner":"Lead Engineer",
 "title":"Hallucination rate exceeds acceptable threshold in production queries",
 "description":"LLM generates plausible but factually incorrect answers when retrieval context is insufficient or ambiguous. Acceptance threshold set at <3% hallucination rate per QA review.",
 "mitigation":"Implement confidence scoring on retrieved chunks; enforce citation of source IDs in every response; add post-generation fact-checking layer against structured metadata. Set up weekly hallucination audit with 100-sample test set.",
 "due_date":"2025-05-15","project":PROJECT},

{"type":"R","impact":4,"likelihood":3,"status":"In Progress","priority":"High","urgency":"High","owner":"Data Architect",
 "title":"PII and sensitive data leaking through RAG responses",
 "description":"Enterprise datasets contain PII (customer names, emails, account numbers). Risk that chunking+retrieval surfaces PII into LLM context, which then appears in user-facing responses. GDPR/compliance exposure.",
 "mitigation":"Implement PII scrubbing at ingestion layer using spaCy NER + regex patterns. Apply column-level masking rules from existing data governance catalogue. Validate with automated PII scanner post-chunking. Restrict embedding of flagged datasets until cleared.",
 "due_date":"2025-04-20","project":PROJECT},

{"type":"R","impact":3,"likelihood":4,"status":"Blocked","priority":"High","urgency":"High","owner":"Platform Engineering Lead",
 "title":"Vector database performance degrades under concurrent enterprise load",
 "description":"Initial load tests with 50 concurrent users show p95 retrieval latency of 4.2s against Weaviate local instance. SLA target is <1.5s. Root cause: single-node deployment, no HNSW tuning.",
 "mitigation":"Scale Weaviate to 3-node cluster. Tune HNSW ef and efConstruction parameters. Implement query result caching (Redis) for top-100 frequent queries. Re-run load test after each change. Escalated: blocked on infrastructure provisioning approval.",
 "due_date":"2025-04-30","project":PROJECT},

{"type":"R","impact":4,"likelihood":2,"status":"Open","priority":"High","urgency":"Medium","owner":"Lead Engineer",
 "title":"Embedding model API rate limits causing pipeline failures at scale",
 "description":"Azure OpenAI text-embedding-ada-002 enforces TPM (tokens-per-minute) limits. Bulk ingestion of 2M+ document chunks risks throttling, causing partial index builds that corrupt retrieval quality.",
 "mitigation":"Implement exponential backoff with jitter in embedding pipeline. Batch requests at 90% of TPM limit. Request Azure quota increase for the subscription. Evaluate fallback to local sentence-transformers for non-critical datasets.",
 "due_date":"2025-05-01","project":PROJECT},

{"type":"R","impact":3,"likelihood":3,"status":"Open","priority":"High","urgency":"Medium","owner":"Data Architect",
 "title":"Knowledge base staleness — RAG answers based on outdated data",
 "description":"Document corpus indexed at PoC start will become stale as source systems update. Risk of RAG confidently answering with outdated schema definitions, deprecated fields, or superseded business rules.",
 "mitigation":"Implement incremental ingestion pipeline triggered by source system change events. Set TTL on vector entries (30-day default). Add 'last updated' metadata to every chunk. Surface data freshness timestamp in UI alongside every RAG response.",
 "due_date":"2025-05-20","project":PROJECT},

{"type":"R","impact":3,"likelihood":3,"status":"In Progress","priority":"High","urgency":"High","owner":"Lead Engineer",
 "title":"Context window overflow — critical chunks truncated for complex queries",
 "description":"GPT-4o context window (128k tokens) exceeded when multiple large documents retrieved. Observed in queries spanning data lineage across 5+ systems. Critical chunks dropped, causing incomplete answers.",
 "mitigation":"Implement hierarchical summarisation: chunk-level → document-level → corpus-level summaries. Use Map-Reduce retrieval pattern for multi-document synthesis. Enforce max-chunk-count=8 per query with re-ranking to select highest-relevance.",
 "due_date":"2025-04-25","project":PROJECT},

{"type":"R","impact":2,"likelihood":4,"status":"Resolved","priority":"Medium","urgency":"Medium","owner":"Data Engineer",
 "title":"Chunking strategy produces semantically incoherent splits",
 "description":"Fixed-size chunking at 512 tokens splits mid-sentence and mid-table, producing meaningless vector representations. Retrieval quality drops significantly for structured data (schemas, mappings).",
 "mitigation":"Replaced fixed-size with semantic chunking using sentence-boundary detection + sliding window overlap (128 tokens). Implemented table-aware chunking for structured content. Quality score improved from 0.61 to 0.84 on internal benchmark. RESOLVED.",
 "due_date":"2025-03-30","project":PROJECT},

{"type":"R","impact":3,"likelihood":2,"status":"Open","priority":"Medium","urgency":"Low","owner":"Platform Engineering Lead",
 "title":"Cloud RAG deployment cost overrun due to uncontrolled embedding re-indexing",
 "description":"Full corpus re-indexing on Azure OpenAI estimated at $1,200 per run. Risk of unintended re-indexing triggers (schema changes, accidental pipeline restarts) blowing monthly budget.",
 "mitigation":"Gate re-indexing behind manual approval step in CI/CD. Implement delta-indexing by default (only changed/new documents). Add cost alerting at $500 and $800 spend thresholds. Restrict full re-index to scheduled maintenance windows.",
 "due_date":"2025-05-30","project":PROJECT},

{"type":"R","impact":4,"likelihood":2,"status":"Open","priority":"High","urgency":"Low","owner":"Data Architect",
 "title":"Model drift — embedding space divergence between local and cloud models",
 "description":"Local (sentence-transformers/all-MiniLM-L6-v2) and cloud (text-embedding-ada-002) produce incompatible vector spaces. Cross-environment retrieval produces near-zero similarity scores. Dual-mode PoC requires unified approach.",
 "mitigation":"Standardise on single embedding model per deployment target. Define model pinning strategy: freeze model version in config, require explicit sign-off to upgrade. Build automated regression test comparing retrieval quality before/after model updates.",
 "due_date":"2025-05-10","project":PROJECT},

{"type":"R","impact":2,"likelihood":3,"status":"Open","priority":"Medium","urgency":"Medium","owner":"Lead Engineer",
 "title":"RAG latency SLA not met for real-time user queries",
 "description":"End-to-end query latency (embed query → retrieve → generate) averaging 3.8s on local, 2.1s on cloud. Business requirement: <2s for 95th percentile. Fails SLA on local deployment.",
 "mitigation":"Profile pipeline bottlenecks: embedding 0.4s, retrieval 1.8s, generation 1.6s. Optimise retrieval via ANN index tuning. Implement streaming response (SSE) so UI shows partial answers while generation completes. Cache embeddings for repeated queries.",
 "due_date":"2025-05-05","project":PROJECT},

{"type":"R","impact":3,"likelihood":2,"status":"Open","priority":"Medium","urgency":"Low","owner":"Data Architect",
 "title":"Data catalogue integration breaks RAG metadata filtering",
 "description":"Malvin platform data catalogue uses proprietary metadata schema. Mapping to RAG filter attributes (domain, owner, classification, freshness) is incomplete. 40% of metadata filters return no results.",
 "mitigation":"Complete field mapping documentation between Malvin catalogue schema and RAG metadata layer. Implement transformation layer in ingestion pipeline. Add integration test suite covering 50 filter combinations. Target: 100% filter coverage by sprint 6.",
 "due_date":"2025-05-15","project":PROJECT},

{"type":"R","impact":2,"likelihood":2,"status":"Open","priority":"Low","urgency":"Low","owner":"Lead Engineer",
 "title":"Open-source LLM (Llama 3) quality insufficient for enterprise queries",
 "description":"Local deployment uses Meta Llama 3 8B for cost reasons. Initial evaluation shows answer quality score 0.71 vs GPT-4o 0.92 on enterprise query benchmark. Gap widest for multi-hop reasoning queries.",
 "mitigation":"Fine-tune Llama 3 on domain-specific Q&A pairs from Malvin corpus. Evaluate Llama 3 70B if GPU capacity allows. Define quality gate: if score <0.80, escalate to cloud GPT-4o. Document trade-off decision formally.",
 "due_date":"2025-06-15","project":PROJECT},

# ══════════════════════════════════════════════════════════════
# ASSUMPTIONS
# ══════════════════════════════════════════════════════════════
{"type":"A","status":"Accepted","priority":"High","urgency":"High","owner":"Data Architect",
 "title":"Azure OpenAI GPT-4o API will remain available with <99.5% uptime SLA throughout PoC",
 "description":"PoC cloud RAG path depends entirely on Azure OpenAI availability. Assuming Microsoft maintains committed SLA. No fallback LLM contracted for cloud path.",
 "mitigation":"Validate: Review Azure SLA documentation. Monitor: Set up uptime alerting. Fallback plan drafted if SLA breached: switch to Azure OpenAI gpt-4-turbo as interim.",
 "due_date":"2025-04-15","project":PROJECT},

{"type":"A","status":"Open","priority":"High","urgency":"Medium","owner":"Lead Engineer",
 "title":"Existing Malvin document corpus is sufficiently clean for ingestion without manual curation",
 "description":"Assuming 80%+ of source documents are structured, well-formatted, and metadata-complete. PoC timelines do not include a data quality remediation sprint.",
 "mitigation":"INVALIDATED PARTIALLY: Initial scan of 12,000 documents found 34% have missing owners, 22% have no classification tags. Scope curation sprint to address top-priority datasets only. Adjust PoC quality expectations accordingly.",
 "due_date":"2025-04-20","project":PROJECT},

{"type":"A","status":"Accepted","priority":"Medium","urgency":"Low","owner":"Platform Engineering Lead",
 "title":"Local GPU infrastructure (4x A100) sufficient for sentence-transformer embedding workload",
 "description":"Assumption that existing Malvin on-prem GPU cluster can handle embedding pipeline without additional procurement. Based on estimated 2M document corpus at 512 tokens avg chunk size.",
 "mitigation":"Validated: Benchmark completed — 2M chunks embedded in 4.2 hours at 85% GPU utilisation. Within acceptable range. Buffer capacity available for 3x growth.",
 "due_date":"2025-04-01","project":PROJECT},

{"type":"A","status":"Open","priority":"Medium","urgency":"Medium","owner":"Data Architect",
 "title":"Malvin platform APIs provide stable, versioned access to all required data sources",
 "description":"RAG ingestion pipeline depends on Malvin platform APIs for document retrieval, metadata, and change events. Assuming APIs are versioned and stable — no breaking changes during PoC.",
 "mitigation":"Track: API changelog subscription active. Mitigation: Abstraction layer in ingestion pipeline isolates API changes. Risk: 2 unversioned legacy endpoints identified — escalating to platform team.",
 "due_date":"2025-05-01","project":PROJECT},

{"type":"A","status":"Accepted","priority":"Low","urgency":"Low","owner":"Lead Engineer",
 "title":"768-dimensional embeddings from text-embedding-ada-002 sufficient for enterprise retrieval quality",
 "description":"Assuming industry-standard 768/1536-dimension embedding space provides adequate semantic resolution for Malvin domain vocabulary without domain-specific fine-tuning.",
 "mitigation":"Validated via A/B test: NDCG@10 = 0.87 on domain queries. No fine-tuning required for PoC. Review at scale-up phase.",
 "due_date":"2025-04-01","project":PROJECT},

{"type":"A","status":"Open","priority":"Medium","urgency":"Low","owner":"Data Architect",
 "title":"Business users will provide sufficient labelled Q&A pairs for evaluation dataset",
 "description":"Quality evaluation of RAG requires 200+ labelled question-answer pairs from domain experts. Assuming business teams allocate 2 days for workshop-based labelling.",
 "mitigation":"Workshop scheduled for Week 5. Risk: Low business engagement historically on technical PoCs. Mitigation: Pre-populate 100 Q&A pairs from existing FAQ documents, ask business to validate rather than create from scratch.",
 "due_date":"2025-05-10","project":PROJECT},

{"type":"A","status":"Deferred","priority":"Low","urgency":"Low","owner":"Lead Engineer",
 "title":"SSO integration with Malvin platform identity provider can be completed within PoC scope",
 "description":"Assumed RAG UI authentication could be handled via Malvin SAML SSO. Deferred after discovering SAML integration requires 4-week security review process.",
 "mitigation":"DEFERRED to Phase 2. PoC will use local role-based auth (username/password). Document SSO requirements for Phase 2 handoff.",
 "due_date":"2025-06-30","project":PROJECT},

{"type":"A","status":"Accepted","priority":"High","urgency":"High","owner":"Data Architect",
 "title":"Weaviate vector database supports required metadata filtering without full-scan overhead",
 "description":"RAG queries require filtering by domain, data owner, classification level, and date range before vector similarity search. Assuming Weaviate's pre-filtering is efficient enough to avoid full-corpus scans.",
 "mitigation":"Validated: Weaviate HNSW with pre-filtering tested at 500k vectors. P95 filtered retrieval = 280ms. Acceptable for PoC. Monitor at full corpus scale.",
 "due_date":"2025-04-10","project":PROJECT},

# ══════════════════════════════════════════════════════════════
# ISSUES
# ══════════════════════════════════════════════════════════════
{"type":"I","status":"Resolved","priority":"High","urgency":"High","owner":"Data Engineer",
 "title":"PDF parsing pipeline fails on scanned documents — zero text extracted",
 "description":"30% of Malvin document corpus are scanned PDFs with no embedded text layer. PyPDF2 extraction returns empty strings. Affected 6,400 documents in initial ingestion run.",
 "mitigation":"RESOLVED: Integrated Tesseract OCR with pdf2image preprocessing. Added fallback pipeline: if text extraction < 100 chars, route to OCR pipeline. Processing time 8x slower for scanned docs — acceptable for batch ingestion. Re-ran ingestion, all documents now indexed.",
 "due_date":"2025-04-05","project":PROJECT},

{"type":"I","status":"Resolved","priority":"High","urgency":"High","owner":"Lead Engineer",
 "title":"LangChain version conflict breaking RetrievalQA chain in Python 3.11",
 "description":"LangChain 0.1.x incompatible with pydantic v2 in Python 3.11 environment. TypeError exceptions on chain initialisation. Blocked local RAG pipeline entirely for 3 days.",
 "mitigation":"RESOLVED: Pinned langchain==0.2.16 with langchain-community==0.2.16. Migrated from deprecated RetrievalQA to LCEL (LangChain Expression Language) chain pattern. Updated all unit tests. Requirements.txt locked.",
 "due_date":"2025-03-28","project":PROJECT},

{"type":"I","status":"In Progress","priority":"High","urgency":"High","owner":"Platform Engineering Lead",
 "title":"Weaviate node crash under sustained load — data loss in vector index",
 "description":"During 72-hour stress test, Weaviate node crashed at hour 41 with OOM error. 12% of indexed vectors lost. Root cause: unbounded HNSW graph growth without memory limits configured.",
 "mitigation":"In Progress: Configuring Weaviate memory limits (LIMIT_RESOURCES=true). Implementing WAL-based persistence with 15-min checkpoint intervals. Adding Prometheus memory alerts. ETA resolution: Sprint 4 end.",
 "due_date":"2025-04-28","project":PROJECT},

{"type":"I","status":"Resolved","priority":"Medium","urgency":"High","owner":"Lead Engineer",
 "title":"Retrieval returns duplicate chunks from same document, filling context window",
 "description":"MMR (Maximal Marginal Relevance) not enabled — top-10 retrieved chunks often 6-7 from same document. Context window wasted on redundant content, reducing answer quality significantly.",
 "mitigation":"RESOLVED: Enabled MMR retrieval with lambda=0.5 (diversity-relevance balance). Implemented document-level deduplication: max 2 chunks per source document per query. Answer quality score improved from 0.72 to 0.84 post-fix.",
 "due_date":"2025-04-08","project":PROJECT},

{"type":"I","status":"Open","priority":"High","urgency":"High","owner":"Data Architect",
 "title":"RAG answers not citing sources — users cannot verify information",
 "description":"Current implementation returns generated text without source citations. Business users report inability to trust or verify answers. Compliance team flagged as blocker for any production use.",
 "mitigation":"Implementing: Modify prompt template to require citation format [Source: {doc_id}, Section: {chunk_id}]. Post-process response to render clickable source links. Add source panel in UI showing full retrieved chunks. Target: Sprint 5 demo.",
 "due_date":"2025-05-02","project":PROJECT},

{"type":"I","status":"In Progress","priority":"Medium","urgency":"Medium","owner":"Data Engineer",
 "title":"Incremental ingestion pipeline misses updates from legacy systems without change data capture",
 "description":"3 legacy source systems (Mainframe exports, Legacy CRM, Archive SharePoint) have no CDC mechanism. Full re-scan required to detect changes, which is cost-prohibitive at scale.",
 "mitigation":"In Progress: Implementing hash-based change detection — MD5 fingerprint stored per document, re-ingestion only if hash changes. For legacy systems: weekly scheduled full scan with smart diff. Estimated 80% reduction in unnecessary re-processing.",
 "due_date":"2025-05-15","project":PROJECT},

{"type":"I","status":"Resolved","priority":"Medium","urgency":"Medium","owner":"Lead Engineer",
 "title":"Azure OpenAI embedding requests failing intermittently — 429 rate limit errors",
 "description":"Ingestion pipeline throwing HTTP 429 errors during peak batch windows. 15% of chunks failed first-pass embedding. Resulted in incomplete vector index with retrieval gaps.",
 "mitigation":"RESOLVED: Implemented token-bucket rate limiter with TPM tracking. Added retry logic: exponential backoff (1s, 2s, 4s, 8s) with jitter. Moved bulk ingestion to off-peak hours (2-6am UTC). 429 error rate dropped from 15% to 0.2%.",
 "due_date":"2025-04-10","project":PROJECT},

{"type":"I","status":"Open","priority":"Medium","urgency":"Low","owner":"Data Architect",
 "title":"Multilingual documents causing embedding quality degradation",
 "description":"Malvin corpus contains documents in EN, DE, FR (10% non-English). text-embedding-ada-002 handles multilingual but quality drops for technical domain terms in German/French. Retrieval misses for non-English queries observed.",
 "mitigation":"Evaluating: multilingual-e5-large as alternative embedding model. Testing language detection at ingestion to route to language-specific models. Timeline: evaluation complete by Sprint 6.",
 "due_date":"2025-05-30","project":PROJECT},

{"type":"I","status":"Blocked","priority":"High","urgency":"High","owner":"Platform Engineering Lead",
 "title":"Local GPU cluster network isolation preventing cloud vector sync",
 "description":"Dual-mode PoC requires periodic sync between local Weaviate and Azure AI Search indexes. Firewall rules block outbound traffic from GPU cluster to Azure endpoints. IT Security review pending.",
 "mitigation":"BLOCKED: Raised IT Security ticket #SEC-4821. Proposed: dedicated egress rule for Azure AI Search FQDN only. Security team review SLA is 15 business days. Escalating to CTO office to expedite. Alternative: manual sync via air-gapped export/import as interim.",
 "due_date":"2025-05-01","project":PROJECT},

{"type":"I","status":"Resolved","priority":"Low","urgency":"Medium","owner":"Lead Engineer",
 "title":"Prompt injection vulnerability in RAG query input",
 "description":"During security review, tester successfully injected instructions via user query that overrode system prompt, causing LLM to disregard retrieval context and answer from training data only.",
 "mitigation":"RESOLVED: Implemented input sanitisation — detect and reject queries containing prompt injection patterns (via LLM-Guard library). Added system prompt hardening: explicit instruction boundary markers. Penetration test re-run: 0 successful injections from 50 test cases.",
 "due_date":"2025-04-12","project":PROJECT},

{"type":"I","status":"Open","priority":"Medium","urgency":"Medium","owner":"Data Engineer",
 "title":"Metadata schema mismatch between Malvin catalogue v2 and v3 format",
 "description":"Malvin platform recently migrated catalogue schema from v2 to v3. 30% of older documents still in v2 format in source system. Ingestion pipeline fails parsing v2 metadata — those documents skipped entirely.",
 "mitigation":"Implementing dual-parser in ingestion: detect schema version from document header, route to v2 or v3 parser accordingly. Unit tests covering 12 edge cases. ETA: Sprint 4.",
 "due_date":"2025-04-25","project":PROJECT},

# ══════════════════════════════════════════════════════════════
# DEPENDENCIES
# ══════════════════════════════════════════════════════════════
{"type":"D","status":"Accepted","priority":"High","urgency":"High","owner":"Lead Engineer",
 "title":"Azure OpenAI Service — GPT-4o and text-embedding-ada-002 API access",
 "description":"Cloud RAG path depends on Azure OpenAI for both embedding generation and answer synthesis. Requires provisioned deployment, quota allocation, and cost approval.",
 "mitigation":"Status: Active. Deployment provisioned in EastUS2. Quota: 300k TPM embedding, 100k TPM GPT-4o. Cost approval: $4,000/month cap approved by CTO. Monitor: Usage dashboard reviewed weekly.",
 "due_date":"2025-04-01","project":PROJECT},

{"type":"D","status":"In Progress","priority":"High","urgency":"High","owner":"Platform Engineering Lead",
 "title":"Weaviate v1.24 cluster — 3-node local deployment on Malvin GPU infrastructure",
 "description":"Local RAG path requires Weaviate vector database deployed on Malvin on-prem infrastructure. Depends on infrastructure team provisioning VMs and persistent storage.",
 "mitigation":"In Progress: VMs provisioned. Weaviate deployed on node 1. Nodes 2-3 pending network configuration. Cluster formation expected Week 4. Blocking: local RAG load tests.",
 "due_date":"2025-04-20","project":PROJECT},

{"type":"D","status":"Accepted","priority":"High","urgency":"Medium","owner":"Data Architect",
 "title":"Malvin Data Catalogue API — document metadata and lineage access",
 "description":"RAG ingestion pipeline depends on Malvin catalogue API for document metadata (owner, domain, classification, last_modified). Required for metadata-filtered retrieval.",
 "mitigation":"Status: API access granted. v3 endpoints stable. v2 legacy endpoints flagged for deprecation — plan migration. Rate limit: 500 req/min. Within ingestion pipeline budget.",
 "due_date":"2025-04-10","project":PROJECT},

{"type":"D","status":"Deferred","priority":"Medium","urgency":"Low","owner":"Lead Engineer",
 "title":"Malvin Identity Provider — SAML SSO for RAG UI authentication",
 "description":"Production RAG UI requires integration with Malvin SSO for enterprise identity management and role-based access. Depends on Identity team completing SAML SP configuration.",
 "mitigation":"DEFERRED to Phase 2. PoC uses local auth (RAID Log role model). SSO requirements documented. Identity team briefed. Integration sprint estimated 3 weeks in Phase 2.",
 "due_date":"2025-07-01","project":PROJECT},

{"type":"D","status":"Accepted","priority":"High","urgency":"High","owner":"Data Engineer",
 "title":"LangChain v0.2 + LlamaIndex v0.10 — RAG orchestration frameworks",
 "description":"Core RAG pipeline built on LangChain (chain orchestration, prompt management) and LlamaIndex (document ingestion, query routing). Both are rapidly evolving — version stability critical.",
 "mitigation":"Pinned: langchain==0.2.16, langchain-community==0.2.16, llama-index==0.10.45. Dependency lockfile committed to repo. Monthly dependency review scheduled. Breaking change monitoring via dependabot alerts.",
 "due_date":"2025-04-15","project":PROJECT},

{"type":"D","status":"Open","priority":"Medium","urgency":"Medium","owner":"Data Architect",
 "title":"SharePoint Online connector — ingestion of policy and governance documents",
 "description":"50% of Malvin governance documents reside in SharePoint Online. RAG ingestion pipeline depends on SharePoint Graph API connector for document access and change event subscription.",
 "mitigation":"Graph API access pending M365 admin approval (ticket #M365-2341). Graph permissions requested: Sites.Read.All, Files.Read.All. ETA approval: 2 weeks. Interim: manual export + local file ingestion.",
 "due_date":"2025-05-01","project":PROJECT},

{"type":"D","status":"Accepted","priority":"Medium","urgency":"Low","owner":"Platform Engineering Lead",
 "title":"Redis Cache — query result caching layer for RAG response acceleration",
 "description":"High-frequency query caching depends on Redis deployed on Malvin infrastructure. Reduces LLM API calls for repeated questions by 60% in internal estimates.",
 "mitigation":"Status: Redis 7.2 deployed on existing Malvin cache infrastructure. TTL configured at 1 hour for query results. Cache hit rate: 34% in first week of PoC. On track.",
 "due_date":"2025-04-15","project":PROJECT},

{"type":"D","status":"Blocked","priority":"High","urgency":"High","owner":"Lead Engineer",
 "title":"Confluence Cloud API — ingestion of architecture decision records and runbooks",
 "description":"Malvin architecture runbooks and ADRs stored in Confluence Cloud. Critical for RAG to answer technical how-to queries. Depends on Atlassian API token with read access.",
 "mitigation":"BLOCKED: API token request rejected — InfoSec requires additional review for cloud API token issuance to non-SaaS workloads. Escalated to CISO. Alternative: scheduled Confluence export to S3, ingest from S3. Workaround in place for PoC.",
 "due_date":"2025-04-25","project":PROJECT},

# ══════════════════════════════════════════════════════════════
# DECISIONS
# ══════════════════════════════════════════════════════════════
{"type":"DC","status":"Accepted","priority":"High","urgency":"High","owner":"Architecture Board",
 "made_by":"Lead Engineer + Data Architect + CTO",
 "title":"Selected Weaviate as vector database for both local and cloud RAG deployments",
 "description":"Architecture decision on vector database technology for Malvin RAG platform. Evaluated 5 candidates across performance, cost, operational complexity, and feature requirements.",
 "options_considered":"1. Weaviate — open source, self-hostable, rich filtering, GraphQL API\n2. Pinecone — managed cloud, easy ops, no local deployment option\n3. ChromaDB — lightweight, local only, limited enterprise features\n4. Azure AI Search — cloud native, native Azure integration, vendor lock-in\n5. pgvector — PostgreSQL extension, familiar ops, limited ANN performance at scale",
 "decision_rationale":"Weaviate selected: only candidate supporting both local and cloud deployment (critical for dual-mode PoC). Rich metadata filtering without post-filtering overhead. Active enterprise support. HNSW index proven at 100M+ vector scale. Weaviate Cloud Services available for cloud path, self-hosted for local.",
 "due_date":"2025-03-15","review_date":"2025-07-01","project":PROJECT},

{"type":"DC","status":"Accepted","priority":"High","urgency":"High","owner":"Lead Engineer",
 "made_by":"Lead Engineer",
 "title":"Adopted LCEL (LangChain Expression Language) over legacy chain patterns",
 "description":"Decision on RAG orchestration pattern within LangChain framework following deprecation warnings on RetrievalQA and ConversationalRetrievalChain.",
 "options_considered":"1. Continue with RetrievalQA chain — familiar but deprecated, will break in LangChain 0.3\n2. Migrate to LCEL — verbose but composable, future-proof, supports streaming\n3. Switch to LlamaIndex QueryEngine — would require significant rewrite\n4. Build custom orchestration — full control but high maintenance burden",
 "decision_rationale":"LCEL adopted: future-proof against LangChain deprecation cycle. Native streaming support resolves latency UX issue. Composable pipes enable per-query routing logic (local vs cloud LLM). Migration effort estimated 3 days — acceptable vs risk of future breaking change.",
 "due_date":"2025-03-28","review_date":"2025-06-01","project":PROJECT},

{"type":"DC","status":"Accepted","priority":"High","urgency":"Medium","owner":"Data Architect",
 "made_by":"Data Architect + Lead Engineer",
 "title":"Semantic chunking with 512-token windows and 128-token overlap as standard",
 "description":"Decision on document chunking strategy for the RAG ingestion pipeline. Chunking directly impacts retrieval quality and embedding coherence.",
 "options_considered":"1. Fixed-size chunking (512 tokens) — simple, fast, semantically incoherent splits\n2. Sentence-boundary chunking — clean splits, variable size, may be too small\n3. Semantic chunking (sentence-transformers cosine similarity) — quality splits, 3x slower\n4. Recursive character splitting — LangChain default, reasonable compromise\n5. Document-structure-aware chunking — best quality, high implementation complexity",
 "decision_rationale":"Semantic chunking selected with 512-token window + 128-token overlap: best retrieval quality in A/B test (NDCG@10: 0.87 vs 0.71 for fixed-size). Table-aware chunking added for structured content. Acceptable ingestion speed for batch workload. Will revisit if real-time ingestion required in Phase 2.",
 "due_date":"2025-04-01","review_date":"2025-07-01","project":PROJECT},

{"type":"DC","status":"Accepted","priority":"High","urgency":"High","owner":"Architecture Board",
 "made_by":"CTO + Data Architect + Lead Engineer",
 "title":"Dual-mode deployment: GPT-4o (cloud) + Llama 3 8B (local) with quality-based routing",
 "description":"Decision on LLM strategy for Malvin RAG — balancing data sovereignty requirements (local) with answer quality requirements (cloud).",
 "options_considered":"1. Cloud-only (GPT-4o) — best quality, data leaves premises, compliance risk\n2. Local-only (Llama 3 8B) — data sovereignty, lower quality, GPU cost\n3. Dual-mode with manual selection — user chooses, too complex for end users\n4. Dual-mode with automatic quality routing — best of both, implementation complexity\n5. Llama 3 70B local — quality comparable to GPT-4o, requires 4x A100 cluster",
 "decision_rationale":"Dual-mode with quality routing selected: compliance-sensitive queries (PII-flagged datasets) routed to local Llama 3 regardless of quality score. All other queries attempt local first; if confidence score <0.75, escalate to cloud GPT-4o. Satisfies compliance and quality requirements. Review at 90-day mark.",
 "due_date":"2025-04-05","review_date":"2025-07-05","project":PROJECT},

{"type":"DC","status":"Accepted","priority":"Medium","urgency":"Medium","owner":"Lead Engineer",
 "made_by":"Lead Engineer",
 "title":"Adopted HyDE (Hypothetical Document Embeddings) for improved query expansion",
 "description":"Decision on query expansion strategy to improve retrieval recall for short or ambiguous queries. Standard RAG underperforms when user query phrasing differs significantly from document vocabulary.",
 "options_considered":"1. No query expansion — simple, fast, poor recall for ambiguous queries\n2. HyDE — LLM generates hypothetical answer, embed that for retrieval\n3. Multi-query expansion — generate N query variants, retrieve for each, union results\n4. Step-back prompting — LLM abstracts query to broader concept first\n5. RAG-Fusion with reciprocal rank fusion — best recall, highest cost and latency",
 "decision_rationale":"HyDE selected for PoC: 18% improvement in recall@10 on internal benchmark vs baseline. Single additional LLM call (fast, cheap gpt-3.5-turbo). Simpler implementation than RAG-Fusion. Will evaluate RAG-Fusion for Phase 2 if HyDE insufficient at scale.",
 "due_date":"2025-04-10","review_date":"2025-06-30","project":PROJECT},

{"type":"DC","status":"Proposed","priority":"Medium","urgency":"Low","owner":"Data Architect",
 "made_by":"Data Architect",
 "title":"Evaluate graph RAG (GraphRAG) for relationship-rich enterprise data queries",
 "description":"Proposal to evaluate Microsoft GraphRAG for queries requiring multi-hop reasoning across related entities (e.g., data lineage queries, cross-domain impact analysis). Standard RAG underperforms on relationship queries.",
 "options_considered":"1. Continue standard RAG — sufficient for document retrieval, poor for relationship queries\n2. Microsoft GraphRAG — knowledge graph + RAG, high implementation cost\n3. Custom knowledge graph (Neo4j) + RAG hybrid — most control, highest effort\n4. LlamaIndex Knowledge Graph Index — middle ground, faster implementation",
 "decision_rationale":"PROPOSED for Phase 2 evaluation. PoC scope too narrow to validate. Decision gate: if >20% of production queries identified as relationship-type in Phase 1 usage analytics, proceed with GraphRAG evaluation sprint.",
 "due_date":"2025-07-01","review_date":"2025-09-01","project":PROJECT},

{"type":"DC","status":"Accepted","priority":"High","urgency":"High","owner":"Architecture Board",
 "made_by":"CISO + Data Architect + Lead Engineer",
 "title":"PII scrubbing mandatory at ingestion — no PII to enter vector index",
 "description":"Compliance decision: how to handle PII in the RAG pipeline. GDPR and internal data classification policy requirements.",
 "options_considered":"1. No PII filtering — fast ingestion, compliance risk, unacceptable\n2. PII scrubbing at ingestion — safe, some information loss, recommended by Legal\n3. PII flagging only — metadata flag, restrict retrieval, complex access control\n4. Anonymisation with pseudonymisation — preserves utility, complex implementation\n5. Exclude PII-classified datasets from RAG entirely — safest, reduces corpus coverage",
 "decision_rationale":"PII scrubbing at ingestion mandatory: spaCy NER + regex patterns remove PII before chunking. PII-classified fields replaced with [REDACTED-{entity_type}] placeholder. Approved by CISO and Legal. Audit log of all scrubbing operations required for compliance evidence.",
 "due_date":"2025-04-08","review_date":"2025-10-01","project":PROJECT},

{"type":"DC","status":"Superseded","priority":"Medium","urgency":"Low","owner":"Lead Engineer",
 "made_by":"Lead Engineer",
 "title":"[SUPERSEDED] Use ChromaDB as vector store for local development",
 "description":"Initial decision to use ChromaDB for local development environment, with migration to Weaviate for staging/production. Superseded when Weaviate local deployment proved simpler than anticipated.",
 "options_considered":"ChromaDB (simple local) vs Weaviate (consistent local+prod). Original rationale: ChromaDB easier for developer laptops.",
 "decision_rationale":"SUPERSEDED by Weaviate selection decision. Maintaining Weaviate across all environments (dev/staging/prod) eliminates environment parity issues. ChromaDB integration code removed from codebase. All developers run Weaviate via Docker Compose locally.",
 "due_date":"2025-03-20","review_date":"2025-03-20","project":PROJECT},
]

# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"Seeding RAG Malvin PoC entries ({len(ENTRIES)} total)…\n")
    token = get_token()
    ok = 0
    for e in ENTRIES:
        if e["type"] == "R" and "impact" in e:
            e["risk_score"] = e["impact"] * e["likelihood"]
            sc = e["risk_score"]
            e["risk_level"] = ("Intolerable" if sc >= 13 else
                               "Substantial" if sc >= 9 else
                               "Moderate"    if sc >= 5 else "Tolerable")
            e["priority"] = "High" if e["risk_level"] in ("Intolerable","Substantial") else (
                "Medium" if e["risk_level"] == "Moderate" else "Low")
        # defaults
        e.setdefault("urgency", e.get("priority","Medium"))
        e.setdefault("description", "")
        e.setdefault("mitigation", e.pop("mitigation", ""))
        r = post(token, e)
        if r.status_code in (200, 201):
            ok += 1
    print(f"\nDone — {ok}/{len(ENTRIES)} entries created.")

if __name__ == "__main__":
    main()

-- ============================================================
-- Test Seed Data — Prioritization Board
-- Org: 300 people | 60 Data & Analytics | 10 Data Governance
--      & Leadership | ~60 Business (20%)
-- 30 voter personas, ~280 votes across 15 tech debt ideas
-- WARNING: Truncates all existing data. Dev/test only.
-- Usage: psql -U postgres -d proj-tech-debt -f db/seed_test_data.sql
-- ============================================================

TRUNCATE votes, admin_log, ideas RESTART IDENTITY CASCADE;

-- ============================================================
-- IDEAS
-- ============================================================
INSERT INTO ideas (title, description, size, category, submitted_by, role, team) VALUES

('Migrate ETL Pipelines from SSIS to Apache Airflow',
 'We have 80+ SSIS packages running on-prem with no version control, no retry logic, and zero observability. Every pipeline failure requires manual intervention. Airflow with dbt would give us DAG versioning, SLA monitoring, and self-healing retries. Estimated 40% reduction in on-call incidents based on peer benchmarks.',
 'XL', 'Pipeline Modernisation', 'Marcus Chen', 'Developer', 'Data Engineering'),

('Eliminate Hardcoded Credentials in 47 Pipeline Configs',
 'Security audit flagged 47 pipeline config files containing plaintext passwords and connection strings committed to version control. Must migrate to Key Vault references before the Q3 compliance review. Severity: High. Exploit risk if repo access is compromised.',
 'M', 'Security & Compliance', 'Priya Nair', 'Manager', 'Data Engineering'),

('Implement CI/CD for Data Pipeline Deployments',
 'All pipeline deployments are currently manual copy-paste to production. No automated testing, no staging environment, no rollback capability. Last quarter we had 3 production outages caused by deployment errors. Need an automated pipeline with integration tests and one-click rollback.',
 'L', 'DevOps', 'Jordan Williams', 'Developer', 'Data Engineering'),

('Decommission Legacy On-Prem Hadoop Cluster',
 'The Hadoop cluster is 7 years old, costs £180k/year in maintenance, and is used by fewer than 5 workloads — all of which can migrate to cloud. Vendor support ends Dec 2025. Decommission saves an estimated £120k/year net of migration costs.',
 'XL', 'Infrastructure', 'Sarah O''Brien', 'Manager', 'Data Engineering'),

('Standardise Data Ingestion Patterns Across 14 Source Systems',
 'Every source system has a bespoke ingestion approach — SFTP, REST, DB replication — none with consistent error handling or retry logic. Standardising on a medallion architecture pattern would cut time to onboard new sources from 3 weeks to 3 days.',
 'L', 'Architecture', 'Dev Patel', 'Developer', 'Data Architecture'),

('Add Data Quality Checks to Critical Production Pipelines',
 'We have no automated data quality gates on 23 of our 30 production pipelines. Last month a currency conversion bug propagated silently for 11 days before an analyst noticed in a board report. Need automated tests with alerting on all critical data paths.',
 'M', 'Data Quality', 'Aisha Mohammed', 'Developer', 'Data Engineering'),

('Migrate Core Transformations from Ad-Hoc SQL Scripts to dbt',
 '200+ transformation SQL scripts live in a shared network drive. No version control, no dependency tracking, no documentation. Three analysts maintain overlapping copies of the same logic. dbt migration would give us lineage, automated testing, and documentation out of the box.',
 'L', 'Pipeline Modernisation', 'Tom Nguyen', 'Developer', 'Data Engineering'),

('Implement Schema Registry for Kafka Event Streams',
 'Kafka topics have no schema enforcement. Producers have broken downstream consumers 4 times this quarter by silently changing field names or types. A schema registry with Avro schemas would catch breaking changes at publish time, before they reach production consumers.',
 'M', 'Architecture', 'Ravi Kumar', 'Developer', 'Platform Engineering'),

('Retire Stale Reports and Build a Governed Dashboard Suite',
 'The BI tenant has 340 published reports, fewer than 60 viewed in the last 90 days. Business teams use 12 different versions of the revenue dashboard. Propose deprecating 280 reports and building 40 certified dashboards with clear ownership, refresh schedules, and SLA.',
 'XL', 'Analytics Modernisation', 'Lisa Park', 'Manager', 'Data Analytics'),

('Standardise Metric Definitions Across All Business Reporting',
 'Revenue is calculated 6 different ways across Finance, Sales, and Analytics. "Active customer" has 4 definitions. "Churn" has 3. Executive meetings regularly spend 30 minutes reconciling numbers before any discussion of insights. A business glossary and certified metric layer is critical.',
 'L', 'Data Quality', 'Fatima Al-Hassan', 'Manager', 'Data Analytics'),

('Build a Metrics Store / Semantic Layer to Replace Ad-Hoc SQL',
 'Every analyst writes their own SQL for the same 50 core metrics. When a definition changes, updates are missed across dozens of reports. A semantic layer (dbt Metrics / Cube) would centralise metric logic and guarantee consistency across all BI tools and data products.',
 'L', 'Architecture', 'James Okafor', 'Developer', 'Data Architecture'),

('Migrate Analyst Workloads from On-Prem SQL Server to Snowflake',
 'Analysts query a SQL Server shared with transactional workloads. Query performance degrades severely at every month-end close. Snowflake''s separation-of-compute model would eliminate contention and enable auto-scaling for peak demand with no analyst-visible downtime.',
 'XL', 'Infrastructure', 'Nina Rodriguez', 'Leader', 'Data Analytics'),

('Implement a Data Catalogue Across All Analytical Datasets',
 'New team members spend 3-4 weeks just finding what data exists and who owns it. There is no central inventory of datasets, schemas, or lineage. A data catalogue integrated with dbt docs would cut onboarding time significantly and reduce duplicate dataset creation.',
 'M', 'Governance', 'Chen Wei', 'Manager', 'Data Architecture'),

('Automate 18 Weekly Excel Reports Still Produced Manually',
 '18 recurring Excel reports require analysts to manually copy data from source systems weekly — approximately 300 analyst-hours per year. All are straightforward to automate with scheduled refreshes or Python scripts. An easy win with immediate capacity impact.',
 'S', 'Analytics Modernisation', 'Kezia Osei', 'Developer', 'Data Analytics'),

('Implement Row-Level Security in the BI Layer for GDPR Compliance',
 'Any user with workspace access can currently view all data regardless of role. HR, Finance, and customer PII are exposed to 150+ users without a business need. A GDPR audit in Q2 flagged this as a critical finding. Remediation is mandatory before the next audit cycle.',
 'M', 'Security & Compliance', 'Oliver James', 'Leader', 'Data Governance & Leadership');


-- ============================================================
-- VOTES
-- ============================================================

-- Idea 1: Migrate SSIS to Airflow
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'Biggest operational pain point. We lose hours every week to SSIS failures Airflow would handle automatically.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   'On-call is dominated by SSIS failures. Cannot ship new pipelines fast enough.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Liam Foster',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Zara Ahmed',       'Developer', 'Data Engineering',             'up',   'Would free up significant time for new work instead of firefighting.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   'ROI on reduced incidents alone covers the effort within 6 months.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   'Strategic priority. Modern orchestration is table stakes for a mature data platform.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   'Our platform team is ready to support Airflow on Kubernetes. Strongly in favour.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   'Pipeline failures affect our dashboards. Reliability improvements benefit everyone.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'Worried about disruption to reports during migration. Is there a phased approach?'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Robert Hughes',    'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Sophie Martin',    'Developer', 'Business',                     'down', 'Impact on business reporting timelines during transition is a concern.'),
((SELECT id FROM ideas WHERE title LIKE '%SSIS%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'down', NULL);

-- Idea 2: Eliminate Hardcoded Credentials
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'Raised this internally 6 months ago. Should have been done already.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   'Compliance risk. Must be resolved before Q3 audit.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   'Non-negotiable. This is a security incident waiting to happen.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Should be top priority given compliance obligations.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Governance requires this. Flagging as critical.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   'Key Vault integration is straightforward. We can provide a template within a sprint.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'As a data consumer I want confidence that our data is secure.'),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hardcoded%'), 'Mia Thompson',     'Developer', 'Data Architecture',            'up',   NULL);

-- Idea 3: Implement CI/CD for Pipelines
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'Cannot keep deploying by hand. We introduced a bug to prod last month doing exactly this.'),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   'A staging environment alone would have prevented our last two incidents.'),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Liam Foster',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Zara Ahmed',       'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   'Engineering velocity is blocked without this.'),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   'We have GitHub Actions runners ready. Can provide the pipeline template.'),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'Deployment freezes during transition could affect report availability.'),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Robert Hughes',    'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%CI/CD%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'down', 'Would like assurance that BI pipeline deployments are not impacted.');

-- Idea 4: Decommission Hadoop
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'Maintaining Hadoop knowledge is a genuine recruitment and retention problem.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   '£120k annual saving makes this one of the highest-ROI items on the board.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   'We should not be running on unsupported infrastructure by end of 2025.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Removing Hadoop unblocks the Snowflake migration too.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Governance risk: unsupported infrastructure by end of year. Must act.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   'Platform team would benefit significantly. Happy to support migration planning.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'down', 'Two of our most critical pipelines are on Hadoop. Migration risk is underestimated.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Liam Foster',      'Developer', 'Data Engineering',             'down', 'Worried about timeline alongside the SSIS migration. Too much at once.'),
((SELECT id FROM ideas WHERE title LIKE '%Hadoop%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'Any outage during migration would be very visible to the business.');

-- Idea 5: Standardise Data Ingestion Patterns
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'Every new source is a from-scratch build. Medallion patterns would change this completely.'),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   '3 weeks to onboard a new source is not acceptable. This would transform delivery speed.'),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   'Architecture team has draft medallion templates ready. Waiting for the green light.'),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Mia Thompson',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   'This is foundational. Everything downstream improves if ingestion is standardised.'),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'How will this affect current data feeds to finance systems during transition?'),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Robert Hughes',    'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ingestion Patterns%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'down', NULL);

-- Idea 6: Add Data Quality Checks
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'The currency bug was embarrassing and entirely preventable. We need quality gates.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   'Trust in our data products depends on quality assurance. High priority.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'Bad data reaches dashboards regularly. Quality checks would catch this upstream.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   'Spent two days last quarter on what turned out to be a null propagation issue upstream.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   'Stakeholders lose confidence every time bad data reaches a report.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Data quality is a governance imperative. Fully support.'),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Quality Checks%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'The currency issue directly affected our monthly finance report. Please prioritise.');

-- Idea 7: Migrate SQL Scripts to dbt
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'The shared drive is a nightmare. Lost a week last year because two engineers had diverged copies.'),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   'dbt testing alone would be transformative. We have no way to validate transforms today.'),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Liam Foster',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   'Lineage from dbt feeds directly into our data catalogue plans.'),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'Analysts can''t trust the transform layer without tests. dbt fixes this.'),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'Will this change how data is structured for existing reports?'),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Robert Hughes',    'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Sophie Martin',    'Developer', 'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Ad-Hoc SQL Scripts%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'down', 'Concerned about report breakage during migration period.');

-- Idea 8: Schema Registry for Kafka
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'up',   'Four breaking schema changes in one quarter is too many. Schema registry is the obvious fix.'),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   'We were the downstream consumer in two of those four incidents. Very painful.'),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   'Avro with schema registry is the industry standard. Overdue.'),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Claire Donovan',   'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Robert Hughes',    'Manager',   'Business',                     'down', 'Sounds highly technical — not clear on the business impact.'),
((SELECT id FROM ideas WHERE title LIKE '%Kafka%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'down', NULL);

-- Idea 9: Retire Stale Reports / Governed Dashboards
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'We spend more time maintaining old reports than building new ones. 340 is unsustainable.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   'Stakeholders keep coming to us with conflicting numbers from different dashboards.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Strategic. A single certified source of truth per domain is non-negotiable.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   'BI team will help identify which reports can be retired.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Governance requires certified data products with clear owners and SLAs.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'Tired of not knowing which version of the revenue report to trust.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'down', 'Retiring 280 reports will create massive stakeholder pushback with no DE support.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Liam Foster',      'Developer', 'Data Engineering',             'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Zara Ahmed',       'Developer', 'Data Engineering',             'down', 'This is not a data engineering problem to solve. Wrong team.'),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Ravi Kumar',       'Developer', 'Platform Engineering',         'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Governed Dashboard%'), 'Sophie Martin',    'Developer', 'Business',                     'down', 'Some "stale" reports are used quarterly. Usage stats don''t tell the whole story.');

-- Idea 10: Standardise Metric Definitions
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Aisha Mohammed',   'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'Stakeholders ask us to reconcile conflicting numbers every single week.'),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   'Revenue having 6 definitions is not acceptable. Number one issue raised by senior stakeholders.'),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Top 3 priority. Directly undermines confidence in analytics.'),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Mia Thompson',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Consistent definitions are a governance baseline. Fully support.'),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'As a finance manager I spend too much time reconciling numbers. Please fix this.'),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Metric Definitions%'), 'Sophie Martin',    'Developer', 'Business',                     'up',   NULL);

-- Idea 11: Metrics Store / Semantic Layer
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   'A semantic layer is the architectural backbone that makes consistent metrics possible at scale.'),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Mia Thompson',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   'Pairs well with the metric definitions initiative. Right long-term solution.'),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   'Would eliminate the copy-paste metric SQL every analyst maintains independently.'),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Claire Donovan',   'Manager',   'Business',                     'down', 'Not clear on the business benefit. Sounds very technical.'),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Robert Hughes',    'Manager',   'Business',                     'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Semantic Layer%'), 'Sophie Martin',    'Developer', 'Business',                     'down', NULL);

-- Idea 12: Migrate to Snowflake
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Month-end degradation impacts our ability to support the business at its most critical time.'),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'Queries that take 30s at peak take 3s on a dedicated compute cluster.'),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Sharing transactional and analytical compute is an anti-pattern. Overdue fix.'),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Tom Nguyen',       'Developer', 'Data Engineering',             'down', 'Migration effort alongside SSIS and Hadoop is too much. Sequencing matters.'),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Liam Foster',      'Developer', 'Data Engineering',             'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Robert Hughes',    'Manager',   'Business',                     'down', 'What is the Snowflake licensing cost? Is this cost-neutral?'),
((SELECT id FROM ideas WHERE title LIKE '%Snowflake%'), 'Sophie Martin',    'Developer', 'Business',                     'down', NULL);

-- Idea 13: Data Catalogue
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'New starters spend their first month doing data archaeology. A catalogue changes this.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   'dbt docs integration makes this much cheaper than a standalone catalogue tool.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   'Data ownership is currently invisible. A catalogue fixes this.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Governance cannot function without an inventory of data assets.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'Would help us understand what data the business has access to.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Sophie Martin',    'Developer', 'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Liam Foster',      'Developer', 'Data Engineering',             'down', 'Tool selection and maintenance overhead. We already have too many platforms.'),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Kyle Watson',      'Developer', 'Platform Engineering',         'down', NULL),
((SELECT id FROM ideas WHERE title LIKE '%Data Catalogue%'), 'Zara Ahmed',       'Developer', 'Data Engineering',             'down', NULL);

-- Idea 14: Automate Weekly Excel Reports
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   'I personally spend 2 hours every Monday on 3 of these. Most immediate capacity win available.'),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Sam Brennan',      'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Grace Liu',        'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   '300 analyst-hours per year is a conservative estimate. Strongly support.'),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   'Easy win. Fast-track given low effort and immediate ROI.'),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'Automated delivery with consistent formatting would be very welcome.'),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Sophie Martin',    'Developer', 'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Jordan Williams',  'Developer', 'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Excel Reports%'), 'Mia Thompson',     'Developer', 'Data Architecture',            'up',   NULL);

-- Idea 15: Row-Level Security / GDPR Compliance
INSERT INTO votes (idea_id, voter_name, role, team, vote, comment) VALUES
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Oliver James',     'Leader',    'Data Governance & Leadership', 'up',   'Governance flagged this. GDPR exposure of PII to 150+ unauthorised users is critical risk.'),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Diana Kearney',    'Leader',    'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Ahmed Malik',      'Manager',   'Data Governance & Leadership', 'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Nina Rodriguez',   'Leader',    'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Lisa Park',        'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Fatima Al-Hassan', 'Manager',   'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Chioma Eze',       'Leader',    'Data Engineering',             'up',   'Non-negotiable compliance item. Must be in the next sprint.'),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Sarah O''Brien',   'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Priya Nair',       'Manager',   'Data Engineering',             'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Kezia Osei',       'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Yemi Adeyemi',     'Developer', 'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Sonia Mehta',      'Manager',   'Business Intelligence',        'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Claire Donovan',   'Manager',   'Business',                     'up',   'HR data exposure is unacceptable. This should be the top priority.'),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Robert Hughes',    'Manager',   'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Sophie Martin',    'Developer', 'Business',                     'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Dev Patel',        'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Chen Wei',         'Manager',   'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'James Okafor',     'Developer', 'Data Architecture',            'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Hassan Ahmed',     'Developer', 'Data Analytics',               'up',   NULL),
((SELECT id FROM ideas WHERE title LIKE '%Row-Level Security%'), 'Marcus Chen',      'Developer', 'Data Engineering',             'up',   NULL);

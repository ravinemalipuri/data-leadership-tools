import { useNavigate } from 'react-router-dom'
import SizeBadge from '../components/SizeBadge'

interface TrackerItem {
  id: number
  title: string
  size: string
  team: string
  status: 'Delivered' | 'Cancelled' | 'Carried Over'
  epic: string
  story: string
  feature: string
  tracker: 'azure' | 'jira'
}

interface QuarterGroup {
  quarter: string
  items: TrackerItem[]
}

const PREVIOUS_QUARTERS: QuarterGroup[] = [
  {
    quarter: '2025-Q4',
    items: [
      { id: 1,  title: 'Centralised Logging & Alerting for All Data Pipelines',   size: 'L',  team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-142', story: 'US-441', feature: 'F-23', tracker: 'azure' },
      { id: 2,  title: 'Power BI Row-Level Security Phase 1 (HR & Finance)',       size: 'M',  team: 'Business Intelligence',        status: 'Delivered',    epic: 'EPIC-155', story: 'US-487', feature: 'F-28', tracker: 'azure' },
      { id: 3,  title: 'Automate Daily Finance Reconciliation Report',             size: 'S',  team: 'Data Analytics',               status: 'Delivered',    epic: 'EPIC-148', story: 'US-462', feature: 'F-25', tracker: 'azure' },
      { id: 4,  title: 'Decommission 3 Unused On-Prem Oracle Data Marts',         size: 'M',  team: 'Data Architecture',            status: 'Delivered',    epic: 'EPIC-151', story: 'US-471', feature: 'F-26', tracker: 'azure' },
    ],
  },
  {
    quarter: '2025-Q3',
    items: [
      { id: 5,  title: 'Snowflake POC for Analytics Workloads',                   size: 'M',  team: 'Data Architecture',            status: 'Delivered',    epic: 'EPIC-131', story: 'US-388', feature: 'F-19', tracker: 'azure' },
      { id: 6,  title: 'Great Expectations Data Quality Framework (Pilot)',        size: 'L',  team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-128', story: 'US-371', feature: 'F-17', tracker: 'azure' },
      { id: 7,  title: 'API Key & Secret Rotation Automation',                    size: 'S',  team: 'Platform Engineering',         status: 'Delivered',    epic: 'EPIC-125', story: 'US-359', feature: 'F-16', tracker: 'azure' },
      { id: 8,  title: 'Sales Pipeline Dashboard — Self-Service Rebuild',         size: 'L',  team: 'Data Analytics',               status: 'Delivered',    epic: 'EPIC-133', story: 'US-398', feature: 'F-20', tracker: 'azure' },
    ],
  },
  {
    quarter: '2025-Q2',
    items: [
      { id: 9,  title: 'dbt Project Foundation and First 30 Core Models',         size: 'XL', team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-112', story: 'US-312', feature: 'F-12', tracker: 'jira'  },
      { id: 10, title: 'Executive KPI Dashboard v1',                              size: 'L',  team: 'Data Analytics',               status: 'Delivered',    epic: 'EPIC-108', story: 'US-298', feature: 'F-10', tracker: 'jira'  },
      { id: 11, title: 'Data Team Onboarding Runbook & Access Governance',        size: 'S',  team: 'Data Governance & Leadership', status: 'Delivered',    epic: 'EPIC-105', story: 'US-285', feature: 'F-9',  tracker: 'jira'  },
      { id: 12, title: 'Kafka Dead-Letter Queue Handling Framework',              size: 'M',  team: 'Platform Engineering',         status: 'Carried Over', epic: 'EPIC-116', story: 'US-328', feature: 'F-14', tracker: 'jira'  },
    ],
  },
  {
    quarter: '2025-Q1',
    items: [
      { id: 13, title: 'Migrate 8 Legacy SFTP Pipelines to REST API Ingest',      size: 'L',  team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-094', story: 'US-241', feature: 'F-6',  tracker: 'jira'  },
      { id: 14, title: 'Business Glossary v1 — 60 Certified Terms',               size: 'M',  team: 'Data Architecture',            status: 'Delivered',    epic: 'EPIC-091', story: 'US-228', feature: 'F-5',  tracker: 'jira'  },
      { id: 15, title: 'Airflow Migration Spike & Architecture Decision Record',   size: 'S',  team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-097', story: 'US-255', feature: 'F-7',  tracker: 'jira'  },
    ],
  },
  {
    quarter: '2024-Q4',
    items: [
      { id: 16, title: 'Cloud Data Lake Setup (Bronze / Silver / Gold Zones)',     size: 'XL', team: 'Data Engineering',             status: 'Delivered',    epic: 'EPIC-078', story: 'US-187', feature: 'F-3',  tracker: 'jira'  },
      { id: 17, title: 'Tableau to Power BI Migration',                           size: 'XL', team: 'Business Intelligence',        status: 'Delivered',    epic: 'EPIC-072', story: 'US-164', feature: 'F-2',  tracker: 'jira'  },
      { id: 18, title: 'GDPR Data Retention Policy Automation',                   size: 'M',  team: 'Data Governance & Leadership', status: 'Delivered',    epic: 'EPIC-081', story: 'US-199', feature: 'F-4',  tracker: 'jira'  },
    ],
  },
]

const STATUS_CLASS: Record<string, string> = {
  'Delivered':    'status-delivered',
  'Cancelled':    'status-cancelled',
  'Carried Over': 'status-carried',
}

const TRACKER_LABEL: Record<string, string> = {
  azure: 'Azure DevOps',
  jira:  'Jira',
}

export default function PreviousQuarters() {
  const navigate = useNavigate()

  function handleTrackerLink(e: React.MouseEvent) {
    e.preventDefault()
    navigate('/', { state: { comingSoon: true } })
  }

  return (
    <div className="page page-wide fade-in">
      <div className="page-header">
        <h1 className="page-title">Previously Prioritised</h1>
        <span className="page-subtitle">Work delivered or committed by quarter — latest first</span>
      </div>

      {PREVIOUS_QUARTERS.map(({ quarter, items }) => (
        <section key={quarter} className="quarter-section">
          <h2 className="quarter-heading">{quarter}</h2>
          <div className="table-wrap">
            <table className="ideas-table pq-table">
              <thead>
                <tr>
                  <th className="th-rank">#</th>
                  <th className="th-title">Idea / Initiative</th>
                  <th className="th-size">Size</th>
                  <th className="th-team">Team</th>
                  <th className="th-status">Status</th>
                  <th className="th-tracker">Tracker</th>
                  <th className="th-ref">Epic #</th>
                  <th className="th-ref">Story #</th>
                  <th className="th-ref">Feature #</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className="idea-row">
                    <td className="td-rank">{i + 1}</td>
                    <td className="td-title">
                      <span className="pq-title">{item.title}</span>
                    </td>
                    <td><SizeBadge size={item.size} /></td>
                    <td className="td-team">{item.team}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="td-tracker">
                      <span className={`tracker-badge tracker-${item.tracker}`}>
                        {TRACKER_LABEL[item.tracker]}
                      </span>
                    </td>
                    <td className="td-ref">
                      <a href="#" className="tracker-link" onClick={handleTrackerLink}>{item.epic}</a>
                    </td>
                    <td className="td-ref">
                      <a href="#" className="tracker-link" onClick={handleTrackerLink}>{item.story}</a>
                    </td>
                    <td className="td-ref">
                      <a href="#" className="tracker-link" onClick={handleTrackerLink}>{item.feature}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

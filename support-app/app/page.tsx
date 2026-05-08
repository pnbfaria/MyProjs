'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '@/components/layout/Header';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  AlertOctagon,
  Timer,
  Activity,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

interface TicketWithSla {
  jiraKey: string;
  summary: string;
  gravity: string;
  client: string;
  assignee: string;
  sla: {
    acknowledge: string;
    response: string;
    acknowledgePercent: number;
    responsePercent: number;
  };
}

function getQuarterOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const options: { quarter: number; year: number; label: string; isCurrent: boolean }[] = [];

  // Generate 8 quarters: 4 back + current + 3 forward
  for (let offset = -4; offset <= 3; offset++) {
    let q = currentQuarter + offset;
    let y = currentYear;
    while (q < 1) { q += 4; y--; }
    while (q > 4) { q -= 4; y++; }
    options.push({
      quarter: q,
      year: y,
      label: `Q${q} ${y}`,
      isCurrent: q === currentQuarter && y === currentYear,
    });
  }

  return options;
}

export default function DashboardPage() {
  const quarterOptions = useMemo(() => getQuarterOptions(), []);

  // Default to Q1 2026 (where data exists) — the user can switch to any quarter
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();

  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketWithSla[]>([]);

  const selectedIndex = quarterOptions.findIndex(
    (o) => o.quarter === selectedQuarter && o.year === selectedYear
  );
  const isCurrentQuarter = selectedQuarter === currentQuarter && selectedYear === currentYear;

  const goToPrev = () => {
    if (selectedIndex > 0) {
      const prev = quarterOptions[selectedIndex - 1];
      setSelectedQuarter(prev.quarter);
      setSelectedYear(prev.year);
    }
  };

  const goToNext = () => {
    if (selectedIndex < quarterOptions.length - 1) {
      const next = quarterOptions[selectedIndex + 1];
      setSelectedQuarter(next.quarter);
      setSelectedYear(next.year);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?quarter=${selectedQuarter}&year=${selectedYear}`),
        fetch('/api/jira/tickets?limit=5'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.data || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [selectedQuarter, selectedYear]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !stats) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="app-content">
          <div className="empty-state">
            <Activity className="empty-state-icon" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
            <div className="empty-state-title">Loading dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="app-content animate-fade-in">
        {/* Page Header with Quarter Selector */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h2 className="page-title">SLA Performance Overview</h2>
            <p className="page-description">
              Real-time monitoring for {stats?.trimester || 'current trimester'} — eSignature Incidents
            </p>
          </div>

          {/* Quarter Selector */}
          <div className="quarter-selector" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              onClick={goToPrev}
              disabled={selectedIndex <= 0}
              className="btn btn--secondary btn--small"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                minWidth: 'unset',
                opacity: selectedIndex <= 0 ? 0.3 : 1,
              }}
              title="Previous quarter"
            >
              <ChevronLeft size={16} />
            </button>

            <select
              value={`${selectedQuarter}-${selectedYear}`}
              onChange={(e) => {
                const [q, y] = e.target.value.split('-').map(Number);
                setSelectedQuarter(q);
                setSelectedYear(y);
              }}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                minWidth: '110px',
                textAlign: 'center',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {quarterOptions.map((opt) => (
                <option key={`${opt.quarter}-${opt.year}`} value={`${opt.quarter}-${opt.year}`}>
                  {opt.label}{opt.isCurrent ? ' (current)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={goToNext}
              disabled={selectedIndex >= quarterOptions.length - 1}
              className="btn btn--secondary btn--small"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-md)',
                minWidth: 'unset',
                opacity: selectedIndex >= quarterOptions.length - 1 ? 0.3 : 1,
              }}
              title="Next quarter"
            >
              <ChevronRight size={16} />
            </button>

            {!isCurrentQuarter && (
              <button
                onClick={() => {
                  setSelectedQuarter(currentQuarter);
                  setSelectedYear(currentYear);
                }}
                className="btn btn--secondary btn--small"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Go to current quarter"
              >
                <Calendar size={12} />
                Today
              </button>
            )}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease' }}>
          {/* Compliance Rate */}
          <div className="card kpi-card kpi-card--success">
            <div className="card-header">
              <div className="kpi-icon kpi-icon--success">
                <Shield size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: 'var(--color-success)' }}>
              {stats?.compliancePercent ?? 0}%
            </div>
            <div className="kpi-label">SLA Compliance Rate</div>
            <div className="kpi-limit">
              <CheckCircle2 size={12} /> Target: 100%
            </div>
          </div>

          {/* Total Incidents */}
          <div className="card kpi-card kpi-card--info">
            <div className="card-header">
              <div className="kpi-icon kpi-icon--info">
                <Activity size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: 'var(--color-info)' }}>
              {stats?.totalIncidents ?? 0}
            </div>
            <div className="kpi-label">Total Incidents</div>
            <div className="kpi-limit">
              <Clock size={12} /> {stats?.trimester}
            </div>
          </div>

          {/* Majeur Count */}
          <div className={`card kpi-card ${(stats?.majeurCount ?? 0) > (stats?.majeurLimit ?? 2) ? 'kpi-card--danger' : 'kpi-card--warning'}`}>
            <div className="card-header">
              <div className={`kpi-icon ${(stats?.majeurCount ?? 0) > (stats?.majeurLimit ?? 2) ? 'kpi-icon--danger' : 'kpi-icon--warning'}`}>
                <AlertOctagon size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{
              color: (stats?.majeurCount ?? 0) > (stats?.majeurLimit ?? 2)
                ? 'var(--color-danger)' : 'var(--color-warning)'
            }}>
              {stats?.majeurCount ?? 0}
            </div>
            <div className="kpi-label">Incidents Majeurs</div>
            <div className="kpi-limit">
              <AlertTriangle size={12} /> Limite: {stats?.majeurLimit ?? 2}
            </div>
          </div>

          {/* Significatif Count */}
          <div className={`card kpi-card ${(stats?.significatifCount ?? 0) > (stats?.significatifLimit ?? 3) ? 'kpi-card--danger' : 'kpi-card--warning'}`}>
            <div className="card-header">
              <div className={`kpi-icon ${(stats?.significatifCount ?? 0) > (stats?.significatifLimit ?? 3) ? 'kpi-icon--danger' : 'kpi-icon--warning'}`}>
                <Timer size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{
              color: (stats?.significatifCount ?? 0) > (stats?.significatifLimit ?? 3)
                ? 'var(--color-danger)' : 'var(--color-warning)'
            }}>
              {stats?.significatifCount ?? 0}
            </div>
            <div className="kpi-label">Incidents Significatifs</div>
            <div className="kpi-limit">
              <AlertTriangle size={12} /> Limite: {stats?.significatifLimit ?? 3}
            </div>
          </div>

          {/* Hors Délai */}
          <div className={`card kpi-card ${(stats?.horsDelaiCount ?? 0) > 0 ? 'kpi-card--danger' : 'kpi-card--success'}`}>
            <div className="card-header">
              <div className={`kpi-icon ${(stats?.horsDelaiCount ?? 0) > 0 ? 'kpi-icon--danger' : 'kpi-icon--success'}`}>
                {(stats?.horsDelaiCount ?? 0) > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
              </div>
            </div>
            <div className="kpi-value" style={{
              color: (stats?.horsDelaiCount ?? 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)'
            }}>
              {stats?.horsDelaiCount ?? 0}
            </div>
            <div className="kpi-label">Interventions Hors Délai</div>
            <div className="kpi-limit">
              <TrendingUp size={12} /> Target: {stats?.horsDelaiTarget ?? 0}/mois
            </div>
          </div>

          {/* Breach Breakdown */}
          <div className="card kpi-card kpi-card--danger">
            <div className="card-header">
              <div className="kpi-icon kpi-icon--danger">
                <AlertTriangle size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: 'var(--color-danger)' }}>
              {(stats?.acknowledgeBreachCount ?? 0) + (stats?.responseBreachCount ?? 0)}
            </div>
            <div className="kpi-label">Total SLA Breaches</div>
            <div className="kpi-limit">
              Ack: {stats?.acknowledgeBreachCount ?? 0} · Res: {stats?.responseBreachCount ?? 0}
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Incidents</h3>
              <div className="card-subtitle">Latest tickets from eSignature space</div>
            </div>
            <a href="/tickets" className="btn btn--secondary btn--small">View All</a>
          </div>

          <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Summary</th>
                  <th>Gravity</th>
                  <th>Client</th>
                  <th>Assignee</th>
                  <th>Acknowledge SLA</th>
                  <th>Response SLA</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                      No tickets found. Run a sync to populate data.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.jiraKey}>
                      <td>
                        <a 
                          href={`${process.env.NEXT_PUBLIC_JIRA_BASE_URL}/browse/${ticket.jiraKey}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontWeight: 600 }}
                        >
                          {ticket.jiraKey}
                        </a>
                      </td>
                      <td style={{
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {ticket.summary}
                      </td>
                      <td>
                        <span className={`badge badge--${
                          ticket.gravity === 'Majeur' ? 'danger' :
                          ticket.gravity === 'Significatif' ? 'warning' : 'info'
                        }`}>
                          {ticket.gravity}
                        </span>
                      </td>
                      <td>{ticket.client}</td>
                      <td>{ticket.assignee || '—'}</td>
                      <td>
                        <span className={`badge badge--${
                          ticket.sla?.acknowledge === 'breached' ? 'danger' :
                          ticket.sla?.acknowledge === 'at-risk' ? 'warning' : 'success'
                        }`}>
                          {ticket.sla?.acknowledge === 'breached' ? 'Breached' :
                           ticket.sla?.acknowledge === 'at-risk' ? 'At Risk' : 'On Track'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${
                          ticket.sla?.response === 'breached' ? 'danger' :
                          ticket.sla?.response === 'at-risk' ? 'warning' : 'success'
                        }`}>
                          {ticket.sla?.response === 'breached' ? 'Breached' :
                           ticket.sla?.response === 'at-risk' ? 'At Risk' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

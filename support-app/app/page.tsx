'use client';

import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketWithSla[]>([]);

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

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
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
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">SLA Performance Overview</h2>
          <p className="page-description">
            Real-time monitoring for {stats?.trimester || 'current trimester'} — eSignature Incidents
          </p>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
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

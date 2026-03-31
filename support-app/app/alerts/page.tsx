'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Bell, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import type { Alert } from '@/lib/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.data || []);
      }
    } catch {
      /* Handle error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      /* Handle error */
    }
  };

  const formatTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <Header title="Alerts" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">Deviation Alerts</h2>
          <p className="page-description">
            Proactive notifications when tickets approach 75% of their SLA deadline
          </p>
        </div>

        {loading ? (
          <div className="empty-state">
            <Clock className="empty-state-icon" />
            <div className="empty-state-title">Loading alerts...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <CheckCircle2 className="empty-state-icon" style={{ color: 'var(--color-success)', opacity: 1 }} />
              <div className="empty-state-title">All Clear!</div>
              <div className="empty-state-text">
                No active SLA deviation alerts. All tickets are within their compliance thresholds.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Summary bar */}
            <div style={{
              display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)',
              fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)',
            }}>
              <span>
                <span className="badge badge--danger" style={{ marginRight: '8px' }}>
                  {alerts.length}
                </span>
                Active alerts
              </span>
              <span>
                {alerts.filter((a) => a.type === 'acknowledge').length} Acknowledge ·{' '}
                {alerts.filter((a) => a.type === 'response').length} Response
              </span>
            </div>

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="card"
                style={{
                  borderLeft: `3px solid ${alert.type === 'acknowledge' ? 'var(--color-warning)' : 'var(--color-danger)'}`,
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  gap: 'var(--space-lg)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)',
                    }}>
                      <AlertTriangle size={16} style={{
                        color: alert.type === 'acknowledge' ? 'var(--color-warning)' : 'var(--color-danger)',
                      }} />
                      <a 
                        href={`${process.env.NEXT_PUBLIC_JIRA_BASE_URL}/browse/${alert.ticketKey}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}
                      >
                        {alert.ticketKey}
                      </a>
                      <span className={`badge badge--${alert.type === 'acknowledge' ? 'warning' : 'danger'}`}>
                        {alert.type === 'acknowledge' ? 'Prise en charge' : 'Délai de réponse'}
                      </span>
                    </div>

                    <div style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                      {alert.ticketSummary}
                    </div>

                    <div style={{
                      display: 'flex', gap: 'var(--space-lg)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)',
                    }}>
                      <span>
                        <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        SLA Deadline: {new Date(alert.slaDeadline).toLocaleString('fr-FR')}
                      </span>
                      <span>
                        Threshold: {alert.thresholdPercent}% elapsed
                      </span>
                      <span>
                        Remaining: {formatTimeRemaining(alert.slaDeadline)}
                      </span>
                      {alert.assignee && (
                        <span>Assignee: {alert.assignee}</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn--secondary btn--small"
                    onClick={() => handleAcknowledge(alert.id)}
                    title="Acknowledge this alert"
                  >
                    <CheckCircle2 size={14} />
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

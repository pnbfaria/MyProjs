'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Search, Users, ExternalLink, Radio, Zap, Clock, Layers } from 'lucide-react';

interface TicketWithSla {
  id: string;
  jiraKey: string;
  summary: string;
  client: string;
  priority: string;
  gravity: string;
  status: string;
  requestedDate: string;
  acknowledgeDate: string | null;
  resolvedDate: string | null;
  assignee: string;
  reporter: string;
  sla: {
    acknowledge: string;
    response: string;
    acknowledgePercent: number;
    responsePercent: number;
    acknowledgeDeadline: string;
    responseDeadline: string;
  };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithSla[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [gravityFilter, setGravityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [clients, setClients] = useState<string[]>([]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
      });
      if (search) params.set('search', search);
      if (clientFilter !== 'all') params.set('client', clientFilter);
      if (gravityFilter !== 'all') params.set('gravity', gravityFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/jira/tickets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.data || []);
        setTotal(data.total || 0);

        const uniqueClients = [...new Set(data.data?.map((t: TicketWithSla) => t.client).filter(Boolean))] as string[];
        if (uniqueClients.length > 0) setClients(uniqueClients);
      }
    } catch {
      /* Handle error */
    } finally {
      setLoading(false);
    }
  }, [page, search, clientFilter, gravityFilter, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Filter tickets by date range on client side
  const filteredTickets = tickets.filter(t => {
    if (dateRange === 'all') return true;
    const reqDate = new Date(t.requestedDate);
    const now = new Date();
    if (dateRange === '7d') return (now.getTime() - reqDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
    if (dateRange === '30d') return (now.getTime() - reqDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
    if (dateRange === '90d') return (now.getTime() - reqDate.getTime()) < 90 * 24 * 60 * 60 * 1000;
    return true;
  });

  return (
    <>
      <Header title="Tickets" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">Incident Tickets</h2>
          <p className="page-description">
            {total} signals intercepted from eSignature space — filtered by Incident type
          </p>
        </div>

        {/* ── CONTROL DECK ── */}
        <div className="control-deck">
          <div className="control-deck-row">
            {/* Search — Spanning */}
            <div className="control-deck-group control-deck-search">
              <label className="control-deck-label">
                <Radio size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Signal Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={14} className="control-deck-search-icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Scan transmissions..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Signal Strength (Priority/Gravity) */}
            <div className="control-deck-group">
              <label className="control-deck-label">
                <Zap size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Signal Strength
              </label>
              <div className="synth-toggle-group">
                <label className="synth-toggle">
                  <input
                    type="radio"
                    name="gravity"
                    checked={gravityFilter === 'all'}
                    onChange={() => { setGravityFilter('all'); setPage(1); }}
                  />
                  <span className="synth-toggle-label">
                    <span className="synth-toggle-led" />
                    All
                  </span>
                </label>
                <label className="synth-toggle synth-toggle--danger">
                  <input
                    type="radio"
                    name="gravity"
                    checked={gravityFilter === 'Majeur'}
                    onChange={() => { setGravityFilter('Majeur'); setPage(1); }}
                  />
                  <span className="synth-toggle-label">
                    <span className="synth-toggle-led" />
                    Majeur
                  </span>
                </label>
                <label className="synth-toggle synth-toggle--warning">
                  <input
                    type="radio"
                    name="gravity"
                    checked={gravityFilter === 'Significatif'}
                    onChange={() => { setGravityFilter('Significatif'); setPage(1); }}
                  />
                  <span className="synth-toggle-label">
                    <span className="synth-toggle-led" />
                    Significatif
                  </span>
                </label>
                <label className="synth-toggle">
                  <input
                    type="radio"
                    name="gravity"
                    checked={gravityFilter === 'Mineur'}
                    onChange={() => { setGravityFilter('Mineur'); setPage(1); }}
                  />
                  <span className="synth-toggle-label">
                    <span className="synth-toggle-led" />
                    Mineur
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="control-deck-row" style={{ marginTop: 'var(--space-md)' }}>
            {/* Time-Stamp Flux (Date Range) */}
            <div className="control-deck-group">
              <label className="control-deck-label">
                <Clock size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Time-Stamp Flux
              </label>
              <div className="synth-toggle-group">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' },
                  { value: '90d', label: '90 Days' },
                ].map(opt => (
                  <label key={opt.value} className="synth-toggle">
                    <input
                      type="radio"
                      name="dateRange"
                      checked={dateRange === opt.value}
                      onChange={() => setDateRange(opt.value)}
                    />
                    <span className="synth-toggle-label">
                      <span className="synth-toggle-led" />
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Origin Point (Client/Category) */}
            <div className="control-deck-group">
              <label className="control-deck-label">
                <Layers size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Origin Point
              </label>
              <div className="synth-toggle-group">
                <label className="synth-toggle">
                  <input
                    type="radio"
                    name="client"
                    checked={clientFilter === 'all'}
                    onChange={() => { setClientFilter('all'); setPage(1); }}
                  />
                  <span className="synth-toggle-label">
                    <span className="synth-toggle-led" />
                    All Origins
                  </span>
                </label>
                {clients.map(c => (
                  <label key={c} className="synth-toggle">
                    <input
                      type="radio"
                      name="client"
                      checked={clientFilter === c}
                      onChange={() => { setClientFilter(c); setPage(1); }}
                    />
                    <span className="synth-toggle-label">
                      <span className="synth-toggle-led" />
                      {c}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="control-deck-group">
              <label className="control-deck-label">
                <Radio size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Transmission Status
              </label>
              <div className="synth-toggle-group">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'Open', label: 'Open' },
                  { value: 'In Progress', label: 'Active' },
                  { value: 'Resolved', label: 'Resolved' },
                  { value: 'Closed', label: 'Closed' },
                ].map(opt => (
                  <label key={opt.value} className="synth-toggle">
                    <input
                      type="radio"
                      name="status"
                      checked={statusFilter === opt.value}
                      onChange={() => { setStatusFilter(opt.value); setPage(1); }}
                    />
                    <span className="synth-toggle-label">
                      <span className="synth-toggle-led" />
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Summary</th>
                <th>Client</th>
                <th>Gravity</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Requested</th>
                <th>Ack SLA</th>
                <th>Response SLA</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-tertiary)' }}>
                    <span style={{ 
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.1em',
                      textShadow: '0 0 10px var(--neon-cyan-glow)',
                      color: 'var(--neon-cyan)',
                    }}>
                      Scanning frequencies...
                    </span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-tertiary)' }}>
                    No signals detected. Adjust control deck parameters or initiate Jira sync.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <a 
                        href={`${process.env.NEXT_PUBLIC_JIRA_BASE_URL}/browse/${ticket.jiraKey}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {ticket.jiraKey}
                        <ExternalLink size={12} style={{ opacity: 0.5 }} />
                      </a>
                    </td>
                    <td style={{
                      maxWidth: '260px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {ticket.summary}
                    </td>
                    <td>
                      <span className="chip">
                        <Users size={12} />
                        {ticket.client || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${
                        ticket.gravity === 'Majeur' ? 'danger' :
                        ticket.gravity === 'Significatif' ? 'warning' : 'info'
                      }`}>
                        {ticket.gravity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${
                        ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'success' :
                        ticket.status === 'In Progress' ? 'info' : 'neutral'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ color: ticket.assignee ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
                      {ticket.assignee || 'Unassigned'}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                      {formatDate(ticket.requestedDate)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge badge--${
                          ticket.sla?.acknowledge === 'breached' ? 'danger' :
                          ticket.sla?.acknowledge === 'at-risk' ? 'warning' : 'success'
                        }`} style={{ fontSize: '10px' }}>
                          {ticket.sla?.acknowledge === 'breached' ? '● Breached' :
                           ticket.sla?.acknowledge === 'at-risk' ? '◐ At Risk' : '● On Track'}
                        </span>
                        <div className="progress-bar" style={{ height: '3px' }}>
                          <div
                            className={`progress-bar-fill progress-bar-fill--${
                              ticket.sla?.acknowledge === 'breached' ? 'danger' :
                              ticket.sla?.acknowledge === 'at-risk' ? 'warning' : 'success'
                            }`}
                            style={{ width: `${Math.min(ticket.sla?.acknowledgePercent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className={`badge badge--${
                          ticket.sla?.response === 'breached' ? 'danger' :
                          ticket.sla?.response === 'at-risk' ? 'warning' : 'success'
                        }`} style={{ fontSize: '10px' }}>
                          {ticket.sla?.response === 'breached' ? '● Breached' :
                           ticket.sla?.response === 'at-risk' ? '◐ At Risk' : '● On Track'}
                        </span>
                        <div className="progress-bar" style={{ height: '3px' }}>
                          <div
                            className={`progress-bar-fill progress-bar-fill--${
                              ticket.sla?.response === 'breached' ? 'danger' :
                              ticket.sla?.response === 'at-risk' ? 'warning' : 'success'
                            }`}
                            style={{ width: `${Math.min(ticket.sla?.responsePercent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 25 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 'var(--space-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)',
          }}>
            <span>Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}</span>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="btn btn--secondary btn--small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn--secondary btn--small"
                disabled={page * 25 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

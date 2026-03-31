'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Search, Filter, Users, ExternalLink } from 'lucide-react';

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

        // Extract unique clients
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

  return (
    <>
      <Header title="Tickets" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">Incident Tickets</h2>
          <p className="page-description">
            {total} tickets from eSignature space — filtered by Incident type
          </p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div style={{ position: 'relative', flex: '1', maxWidth: '320px' }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
            <input
              type="text"
              className="input"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select
            className="select"
            value={clientFilter}
            onChange={(e) => { setClientFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="select"
            value={gravityFilter}
            onChange={(e) => { setGravityFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Gravities</option>
            <option value="Majeur">Majeur</option>
            <option value="Significatif">Significatif</option>
            <option value="Mineur">Mineur</option>
          </select>

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
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
                    Loading tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-tertiary)' }}>
                    No tickets found. Try adjusting your filters or sync with Jira.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
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

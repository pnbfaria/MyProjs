'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { FileBarChart, Download, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { ReportData } from '@/lib/types';

export default function ReportsPage() {
  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [periodType, setPeriodType] = useState<'trimester' | 'month'>('trimester');
  const [periodValue, setPeriodValue] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate period options
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

  const trimesterOptions = [];
  for (let y = currentYear; y >= currentYear - 1; y--) {
    for (let q = (y === currentYear ? currentQuarter : 4); q >= 1; q--) {
      trimesterOptions.push({ value: `${y}-Q${q}`, label: `Q${q} ${y}` });
    }
  }

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }

  useEffect(() => {
    // Set default period
    if (!periodValue) {
      setPeriodValue(periodType === 'trimester'
        ? `${currentYear}-Q${currentQuarter}`
        : `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
      );
    }

    // Fetch clients
    fetch('/api/reports/generate')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClients(data.data.clients || []);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          periodType,
          periodValue,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Reports" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">SLA Reporting</h2>
          <p className="page-description">
            Generate and export structured SLA compliance reports for client verification
          </p>
        </div>

        {/* Report Configuration Form */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Report Configuration</h3>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-md)', marginBottom: 'var(--space-lg)',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px', fontWeight: 600 }}>
                Period Type
              </label>
              <select
                className="select"
                value={periodType}
                onChange={(e) => {
                  const type = e.target.value as 'trimester' | 'month';
                  setPeriodType(type);
                  setPeriodValue(type === 'trimester'
                    ? `${currentYear}-Q${currentQuarter}`
                    : `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
                  );
                }}
              >
                <option value="trimester">Trimester</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px', fontWeight: 600 }}>
                Period
              </label>
              <select className="select" value={periodValue} onChange={(e) => setPeriodValue(e.target.value)}>
                {(periodType === 'trimester' ? trimesterOptions : monthOptions).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: '4px', fontWeight: 600 }}>
                Client
              </label>
              <select className="select" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
                <option value="all">All Clients</option>
                {clients.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn btn--primary"
                onClick={generateReport}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileBarChart size={16} />}
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Report Preview */}
        {report && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <div>
                <h3 className="card-title">Rapport SLA — {report.client}</h3>
                <div className="card-subtitle">
                  Period: {report.period} · Generated: {new Date(report.generatedAt).toLocaleString('fr-FR')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button className="btn btn--secondary btn--small" onClick={() => window.print()}>
                  <Download size={14} /> PDF
                </button>
                <button className="btn btn--secondary btn--small" disabled>
                  <Download size={14} /> Excel
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
              fontSize: 'var(--font-size-sm)',
            }}>
              <span className="badge badge--info">{report.summary.totalMetrics} metrics</span>
              <span className="badge badge--success">
                <CheckCircle2 size={12} /> {report.summary.compliant} compliant
              </span>
              {report.summary.nonCompliant > 0 && (
                <span className="badge badge--danger">
                  <XCircle size={12} /> {report.summary.nonCompliant} non-compliant
                </span>
              )}
            </div>

            {/* Report Table */}
            <div className="table-container" style={{
              border: 'none', background: 'transparent',
            }}>
              <table className="table">
                <thead>
                  <tr style={{ background: 'rgba(220, 50, 50, 0.15)' }}>
                    <th style={{ color: '#ff6b6b' }}>Aspect de la prestation</th>
                    <th style={{ color: '#ff6b6b' }}>Paramètre</th>
                    <th style={{ color: '#ff6b6b' }}>Métrique</th>
                    <th style={{ color: '#ff6b6b' }}>Limite</th>
                    <th style={{ color: '#ff6b6b' }}>Actuel</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.aspect}</td>
                      <td>{row.parametre}</td>
                      <td>{row.metrique}</td>
                      <td>
                        <span className="badge badge--neutral">{row.limite}</span>
                      </td>
                      <td>
                        <span className={`badge badge--${row.isCompliant ? 'success' : 'danger'}`}>
                          {row.isCompliant ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {row.actuel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

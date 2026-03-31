'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Settings, CheckCircle2, XCircle, RefreshCw, Loader2, AlertTriangle, Info, Zap } from 'lucide-react';

interface ConnectionStatus {
  connection: {
    connected: boolean;
    method: string;
    user?: string;
  };
  lastSync: {
    status: string;
    startedAt: string;
    completedAt: string | null;
    ticketsProcessed: number;
    ticketsCreated: number;
    ticketsUpdated: number;
  } | null;
  config: {
    baseUrl: string;
    serviceAccount: string;
    apiToken: string;
    spaceKey: string;
  };
}

interface SyncResult {
  success: boolean;
  message?: string;
  ticketsProcessed?: number;
  ticketsCreated?: number;
  ticketsUpdated?: number;
  errors?: string[];
  connection?: { connected: boolean; method: string; user?: string };
  error?: string;
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jira/sync');
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/jira/sync', { method: 'POST' });
      const data = await res.json();
      setSyncResult(data);
      // Refresh status after sync
      checkStatus();
    } catch (e) {
      setSyncResult({ success: false, error: String(e) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Header title="Settings" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">System Settings</h2>
          <p className="page-description">Jira integration configuration and connection diagnostics</p>
        </div>

        {loading ? (
          <div className="empty-state">
            <Loader2 className="empty-state-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <div className="empty-state-title">Checking connection...</div>
          </div>
        ) : (
          <>
            {/* Connection Status Card */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <Zap size={18} style={{ marginRight: '8px' }} />
                  Jira Connection
                </h3>
                <button className="btn btn--secondary btn--small" onClick={checkStatus}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                background: status?.connection.connected
                  ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                border: `1px solid ${status?.connection.connected
                  ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                marginBottom: 'var(--space-lg)',
              }}>
                {status?.connection.connected ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
                ) : (
                  <XCircle size={20} style={{ color: 'var(--color-danger)' }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, color: status?.connection.connected ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {status?.connection.connected
                      ? `Connected as ${status.connection.user}`
                      : 'Not Connected'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                    Auth method: {status?.connection.method || 'none'}
                  </div>
                </div>
              </div>

              {/* Configuration Details */}
              <div style={{ fontSize: 'var(--font-size-sm)' }}>
                <table className="table" style={{ background: 'transparent' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, width: '200px' }}>Base URL</td>
                      <td style={{ fontFamily: 'monospace' }}>{status?.config.baseUrl}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Service Account</td>
                      <td style={{ fontFamily: 'monospace' }}>{status?.config.serviceAccount}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>API Token</td>
                      <td style={{ fontFamily: 'monospace' }}>{status?.config.apiToken}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Project Key</td>
                      <td style={{ fontFamily: 'monospace' }}>{status?.config.spaceKey}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Auth Help */}
              {!status?.connection.connected && (
                <div style={{
                  marginTop: 'var(--space-lg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                    <strong style={{ color: 'var(--color-warning)' }}>Authentication Setup Required</strong>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Your Service Account Token (ATSTT...) requires OAuth2 authentication through <code>api.atlassian.com</code>.
                    For direct REST API access, generate a <strong>Personal API Token</strong> instead:
                  </p>
                  <ol style={{ color: 'var(--color-text-secondary)', paddingLeft: '20px' }}>
                    <li>Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>id.atlassian.com → Security → API Tokens</a></li>
                    <li>Click &quot;Create API token&quot; and copy the token</li>
                    <li>Update <code>.env.local</code>:
                      <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginTop: '4px' }}>
                        <li><code>JIRA_SERVICE_ACCOUNT=your-email@domain.com</code></li>
                        <li><code>JIRA_API_TOKEN=your-personal-api-token</code></li>
                      </ul>
                    </li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Sync Actions */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="card-header">
                <h3 className="card-title">
                  <RefreshCw size={18} style={{ marginRight: '8px' }} />
                  Sync Control
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <button
                  className="btn btn--primary"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>

                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                  Fetches all issues from project {status?.config.spaceKey} and updates local database
                </span>
              </div>

              {/* Last Sync Info */}
              {status?.lastSync && (
                <div style={{
                  padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-elevated)', border: '1px solid var(--border-color)',
                  fontSize: 'var(--font-size-sm)',
                }}>
                  <div style={{ marginBottom: '4px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Last Sync</div>
                  <div style={{ color: 'var(--color-text-tertiary)' }}>
                    Status: <span className={`badge badge--${status.lastSync.status === 'completed' ? 'success' : 'danger'}`}>
                      {status.lastSync.status}
                    </span>
                    {' · '}
                    {new Date(status.lastSync.startedAt).toLocaleString('fr-FR')}
                    {' · '}
                    {status.lastSync.ticketsProcessed} processed,{' '}
                    {status.lastSync.ticketsCreated} created,{' '}
                    {status.lastSync.ticketsUpdated} updated
                  </div>
                </div>
              )}

              {/* Sync Result */}
              {syncResult && (
                <div style={{
                  marginTop: 'var(--space-md)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                  background: syncResult.success ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  border: `1px solid ${syncResult.success ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                  fontSize: 'var(--font-size-sm)',
                }}>
                  {syncResult.success ? (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                        <strong style={{ color: 'var(--color-success)' }}>Sync Completed</strong>
                      </div>
                      {syncResult.ticketsProcessed !== undefined ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>
                          {syncResult.ticketsProcessed} tickets processed · {syncResult.ticketsCreated} created · {syncResult.ticketsUpdated} updated
                        </div>
                      ) : (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{syncResult.message}</div>
                      )}
                      {syncResult.errors && syncResult.errors.length > 0 && (
                        <div style={{ marginTop: '8px', color: 'var(--color-warning)' }}>
                          Warnings: {syncResult.errors.join(', ')}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <XCircle size={16} style={{ color: 'var(--color-danger)' }} />
                        <strong style={{ color: 'var(--color-danger)' }}>Sync Failed</strong>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>{syncResult.error}</div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Info size={18} style={{ marginRight: '8px' }} />
                  About SupportApp
                </h3>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <p>SupportApp monitors SLA compliance for the eSignature support team.</p>
                <ul style={{ paddingLeft: '20px', marginTop: 'var(--space-sm)', lineHeight: '1.8' }}>
                  <li><strong>SUP-1:</strong> Jira synchronization engine</li>
                  <li><strong>SUP-2:</strong> SLA calculation (Priority → Gravity → Business hours)</li>
                  <li><strong>SUP-3:</strong> Real-time performance dashboard</li>
                  <li><strong>SUP-4:</strong> Deviation alert system (75% threshold)</li>
                  <li><strong>SUP-5:</strong> Automated report generation</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

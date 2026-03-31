'use client';

import { Bell, RefreshCw, Search, User } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Dashboard' }: HeaderProps) {
  const [alertCount, setAlertCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const fetchAlertCount = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts?countOnly=true');
      if (res.ok) {
        const data = await res.json();
        setAlertCount(data.count || 0);
      }
    } catch {
      // Silently skip
    }
  }, []);

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, [fetchAlertCount]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/jira/sync', { method: 'POST' });
      if (res.ok) {
        setLastSync(new Date().toLocaleTimeString());
        fetchAlertCount();
      }
    } catch {
      // Handle error
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        {/* Sync Status */}
        <div className="header-sync-status">
          <span className="header-sync-dot" />
          <span>{lastSync ? `Synced ${lastSync}` : 'Connected'}</span>
        </div>

        {/* Sync Button */}
        <button
          className="header-icon-btn"
          onClick={handleSync}
          disabled={syncing}
          title="Sync with Jira"
        >
          <RefreshCw
            size={18}
            style={{
              animation: syncing ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>

        {/* Alerts */}
        <Link href="/alerts" className="header-icon-btn" title="View Alerts">
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="header-badge">{alertCount > 9 ? '9+' : alertCount}</span>
          )}
        </Link>

        {/* User Avatar */}
        <button className="header-icon-btn" title="Profile">
          <User size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}

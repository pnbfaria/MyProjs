'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import {
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface AnalyticsData {
  totalTickets: number;
  gravityDistribution: { name: string; value: number; color: string }[];
  statusDistribution: { name: string; value: number }[];
  clientBreakdown: {
    client: string;
    total: number;
    breached: number;
    compliant: number;
    complianceRate: number;
  }[];
  monthlyTrends: {
    month: string;
    totalIncidents: number;
    ackCompliance: number;
    resCompliance: number;
    overallCompliance: number;
  }[];
  slaPerformance: {
    acknowledgeBreachRate: number;
    responseBreachRate: number;
    overallHealth: { name: string; value: number; color: string }[];
  };
  responseTimeAnalysis: {
    gravity: string;
    avgAcknowledgeHours: number | null;
    avgResolveHours: number | null;
    ticketCount: number;
  }[];
  weeklyVolume: { week: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  'Resolved': '#10B981',
  'In Progress': '#3B82F6',
  'Open': '#F59E0B',
  'Backlog': '#8B5CF6',
  'Closed': '#6B7280',
  'Waiting for customer': '#EC4899',
};

const CHART_THEME = {
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontSize: 11,
  axisColor: '#94A3B8',
  gridColor: '#E2E8F0',
  tooltipBg: '#1E293B',
  tooltipBorder: '#334155',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: CHART_THEME.tooltipBg,
      border: `1px solid ${CHART_THEME.tooltipBorder}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
      color: '#F1F5F9',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '6px', color: '#CBD5E1' }}>{label}</div>
      {payload.map((p: { name: string; value: number; color: string }, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#94A3B8' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' && p.name?.includes('%') ? `${p.value}%` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <>
        <Header title="Analytics" />
        <div className="app-content">
          <div className="empty-state">
            <Loader2 className="empty-state-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <div className="empty-state-title">Loading analytics...</div>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header title="Analytics" />
        <div className="app-content">
          <div className="empty-state">
            <AlertTriangle className="empty-state-icon" />
            <div className="empty-state-title">Unable to load analytics data</div>
          </div>
        </div>
      </>
    );
  }

  // Compute summary KPIs
  const totalBreached = data.slaPerformance.overallHealth.find(h => h.name === 'Breached')?.value || 0;
  const totalOnTrack = data.slaPerformance.overallHealth.find(h => h.name === 'On Track')?.value || 0;
  const overallComplianceRate = data.totalTickets > 0
    ? Math.round((totalOnTrack / data.totalTickets) * 100) : 100;

  const radialData = [
    {
      name: 'Compliance',
      value: overallComplianceRate,
      fill: overallComplianceRate >= 80 ? '#10B981' : overallComplianceRate >= 60 ? '#F59E0B' : '#E60012',
    },
  ];

  return (
    <>
      <Header title="Analytics" />
      <div className="app-content animate-fade-in">
        <div className="page-header">
          <h2 className="page-title">Performance Analytics</h2>
          <p className="page-description">
            Deep dive into SLA performance, incident trends, and client health — powered by live Jira data
          </p>
        </div>

        {/* ── Row 1: Top-Level KPI Scorecards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
        }}>
          {/* Overall Compliance Gauge */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ width: '64px', height: '64px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={6}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: radialData[0].fill, lineHeight: 1 }}>
                {overallComplianceRate}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                SLA Compliance
              </div>
            </div>
          </div>

          {/* Total Tickets */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {data.totalTickets}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                Total Incidents
              </div>
            </div>
          </div>

          {/* Breached */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(230, 0, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={22} style={{ color: '#E60012' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#E60012', lineHeight: 1 }}>
                {totalBreached}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                SLA Breaches
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {data.clientBreakdown.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                Active Clients
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: SLA Compliance Trend + Health Pie ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}>
          {/* Compliance Trend */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-accent)' }} />
                SLA Compliance Trend
              </h3>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAck" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                  <XAxis dataKey="month" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="ackCompliance" name="Acknowledge %" stroke="#10B981" fill="url(#gradAck)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="resCompliance" name="Response %" stroke="#3B82F6" fill="url(#gradRes)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall SLA Health Donut */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} style={{ color: 'var(--color-accent)' }} />
                SLA Health
              </h3>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.slaPerformance.overallHealth}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.slaPerformance.overallHealth.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 3: Client Performance + Gravity Distribution ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}>
          {/* Client SLA Performance */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--color-accent)' }} />
                Client SLA Performance
              </h3>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.clientBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                  <XAxis dataKey="client" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} />
                  <YAxis tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="compliant" name="Compliant" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breached" name="Breached" fill="#E60012" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gravity Distribution */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-accent)' }} />
                Incident Severity
              </h3>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.gravityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.gravityDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 4: Weekly Volume + Response Time + Status Breakdown ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
        }}>
          {/* Weekly Volume */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--color-accent)' }} />
                Weekly Volume
              </h3>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: CHART_THEME.axisColor }} />
                  <YAxis tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tickets" fill="#E60012" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Avg Response Times by Gravity */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                Avg Response Time (hrs)
              </h3>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.responseTimeAnalysis} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} />
                  <XAxis type="number" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} unit="h" />
                  <YAxis dataKey="gravity" type="category" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axisColor }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="avgAcknowledgeHours" name="Acknowledge" fill="#10B981" radius={[0, 4, 4, 0]} barSize={14} />
                  <Bar dataKey="avgResolveHours" name="Resolve" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-accent)' }} />
                Status Breakdown
              </h3>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 5: Client Compliance Table ── */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-accent)' }} />
              Client Compliance Summary
            </h3>
          </div>
          <div className="table-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Tickets</th>
                  <th>Compliant</th>
                  <th>Breached</th>
                  <th>Compliance Rate</th>
                  <th style={{ width: '200px' }}>SLA Health</th>
                </tr>
              </thead>
              <tbody>
                {data.clientBreakdown.map((client) => (
                  <tr key={client.client}>
                    <td style={{ fontWeight: 600 }}>{client.client}</td>
                    <td>{client.total}</td>
                    <td>
                      <span className="badge badge--success">
                        <CheckCircle2 size={12} /> {client.compliant}
                      </span>
                    </td>
                    <td>
                      {client.breached > 0 ? (
                        <span className="badge badge--danger">
                          <XCircle size={12} /> {client.breached}
                        </span>
                      ) : (
                        <span className="badge badge--neutral">0</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: client.complianceRate >= 80 ? '#10B981' :
                               client.complianceRate >= 60 ? '#F59E0B' : '#E60012',
                      }}>
                        {client.complianceRate}%
                      </span>
                    </td>
                    <td>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${client.complianceRate}%`,
                          height: '100%',
                          borderRadius: '4px',
                          background: client.complianceRate >= 80 ? '#10B981' :
                                     client.complianceRate >= 60 ? '#F59E0B' : '#E60012',
                          transition: 'width 1s ease-out',
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

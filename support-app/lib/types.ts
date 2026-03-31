// ── Ticket (mirrors Jira Incident fields) ──

export type SlaGravity = 'Majeur' | 'Significatif' | 'Mineur';
export type SlaStatusLevel = 'on-track' | 'at-risk' | 'breached';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Backlog';

export interface Ticket {
  id: string;
  jiraKey: string;
  summary: string;
  description: string;
  client: string;
  priority: string;
  gravity: SlaGravity;
  status: TicketStatus;
  requestedDate: string;          // ISO date
  acknowledgeDate: string | null;  // ISO date or null
  resolvedDate: string | null;     // ISO date or null
  reporter: string;
  assignee: string;
  namirialContacted: boolean;
  timeTracking: string | null;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── SLA ──

export interface SlaThreshold {
  value: number;
  unit: 'hours' | 'days';
}

export interface SlaConfig {
  acknowledge: SlaThreshold;
  response: SlaThreshold;
}

export interface SlaDeadlines {
  acknowledgeDeadline: Date;
  responseDeadline: Date;
}

export interface SlaStatus {
  acknowledge: SlaStatusLevel;
  response: SlaStatusLevel;
  acknowledgeDeadline: string;
  responseDeadline: string;
  acknowledgeRemaining: number;  // ms remaining (negative = breached)
  responseRemaining: number;     // ms remaining (negative = breached)
  acknowledgePercent: number;    // 0-100+ percent of SLA time elapsed
  responsePercent: number;       // 0-100+ percent of SLA time elapsed
}

// ── Alerts (SUP-4) ──

export type AlertType = 'acknowledge' | 'response';

export interface Alert {
  id: string;
  ticketId: string;
  ticketKey: string;
  ticketSummary: string;
  type: AlertType;
  thresholdPercent: number;
  slaDeadline: string;
  assignee: string;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt: string | null;
}

// ── Dashboard KPIs (SUP-3) ──

export interface DashboardStats {
  totalIncidents: number;
  majeurCount: number;
  majeurLimit: number;
  significatifCount: number;
  significatifLimit: number;
  horsDelaiCount: number;
  horsDelaiTarget: number;
  acknowledgeBreachCount: number;
  responseBreachCount: number;
  compliancePercent: number;
  trimester: string;
  lastUpdated: string;
}

export interface MonthlyTrend {
  month: string;
  acknowledgeCompliance: number;
  responseCompliance: number;
  totalIncidents: number;
}

// ── Reports (SUP-5) ──

export interface ReportRow {
  aspect: string;
  parametre: string;
  metrique: string;
  limite: string;
  actuel: string;
  isCompliant: boolean;
}

export interface ReportData {
  title: string;
  client: string;
  period: string;
  generatedAt: string;
  rows: ReportRow[];
  summary: {
    totalMetrics: number;
    compliant: number;
    nonCompliant: number;
  };
}

export interface ReportFilters {
  client: string;
  periodType: 'month' | 'trimester';
  periodValue: string;  // e.g., "2026-Q1" or "2026-03"
}

// ── API Responses ──

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ── Jira field mapping ──

export interface JiraFieldMapping {
  jiraFieldId: string;
  appFieldName: keyof Ticket;
  label: string;
  editable: boolean;
  type: 'string' | 'date' | 'boolean' | 'select';
}

export interface SyncResult {
  ticketsProcessed: number;
  ticketsCreated: number;
  ticketsUpdated: number;
  errors: string[];
  duration: number;
  completedAt: string;
}

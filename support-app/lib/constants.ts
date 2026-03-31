import type { SlaConfig, SlaGravity, JiraFieldMapping } from './types';

// ── SLA Matrix (from SUP-2) ──

export const SLA_MATRIX: Record<SlaGravity, SlaConfig> = {
  Majeur: {
    acknowledge: { value: 1, unit: 'hours' },
    response: { value: 4, unit: 'hours' },
  },
  Significatif: {
    acknowledge: { value: 4, unit: 'hours' },
    response: { value: 6, unit: 'hours' },
  },
  Mineur: {
    acknowledge: { value: 2, unit: 'days' },
    response: { value: 5, unit: 'days' },
  },
} as const;

// ── Priority → Gravity Mapping ──

export const PRIORITY_TO_GRAVITY: Record<string, SlaGravity> = {
  Highest: 'Majeur',
  High: 'Majeur',
  Medium: 'Significatif',
  Low: 'Mineur',
  Lowest: 'Mineur',
  // French equivalents
  Majeur: 'Majeur',
  Significatif: 'Significatif',
  Mineur: 'Mineur',
};

// ── Business Hours Config ──

export const BUSINESS_HOURS = {
  start: 9,  // 09:00
  end: 18,   // 18:00
} as const;

export const BUSINESS_DAYS = [1, 2, 3, 4, 5] as const; // Mon=1 to Fri=5

// Public holidays (ISO date strings, extend as needed)
export const HOLIDAYS: string[] = [
  // 2026 French public holidays
  '2026-01-01', // Jour de l'An
  '2026-04-06', // Lundi de Pâques
  '2026-05-01', // Fête du Travail
  '2026-05-08', // Victoire 1945
  '2026-05-14', // Ascension
  '2026-05-25', // Lundi de Pentecôte
  '2026-07-14', // Fête Nationale
  '2026-08-15', // Assomption
  '2026-11-01', // Toussaint
  '2026-11-11', // Armistice
  '2026-12-25', // Noël
];

// ── Trimester Limits (from SUP-3) ──

export const TRIMESTER_LIMITS = {
  majeur: 2,
  significatif: 3,
  horsDelaiTarget: 0,
} as const;

// ── Alert Thresholds (from SUP-4) ──

export const ALERT_THRESHOLD_PERCENT = 75;

// ── Jira Field Mappings (from SUP-1) ──

export const JIRA_FIELD_MAPPINGS: JiraFieldMapping[] = [
  { jiraFieldId: 'summary', appFieldName: 'summary', label: 'Summary', editable: true, type: 'string' },
  { jiraFieldId: 'customfield_10044', appFieldName: 'requestedDate', label: 'Requested date', editable: false, type: 'date' },
  { jiraFieldId: 'customfield_10037', appFieldName: 'client', label: 'Client', editable: false, type: 'string' },
  { jiraFieldId: 'description', appFieldName: 'description', label: 'Description', editable: true, type: 'string' },
  { jiraFieldId: 'priority', appFieldName: 'priority', label: 'Priority', editable: true, type: 'select' },
  { jiraFieldId: 'status', appFieldName: 'status', label: 'Status', editable: false, type: 'string' },
  { jiraFieldId: 'customfield_10045', appFieldName: 'resolvedDate', label: 'Resolved', editable: true, type: 'date' },
  { jiraFieldId: 'customfield_10046', appFieldName: 'acknowledgeDate', label: 'Acknowledge', editable: true, type: 'date' },
  { jiraFieldId: 'reporter', appFieldName: 'reporter', label: 'Reporter', editable: false, type: 'string' },
  { jiraFieldId: 'assignee', appFieldName: 'assignee', label: 'Assignee', editable: true, type: 'string' },
  { jiraFieldId: 'customfield_10038', appFieldName: 'namirialContacted', label: 'Namirial Contacted?', editable: true, type: 'boolean' },
  { jiraFieldId: 'timetracking', appFieldName: 'timeTracking', label: 'Time tracking', editable: false, type: 'string' },
];

// ── Navigation Items ──

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Tickets', href: '/tickets', icon: 'Ticket' },
  { label: 'Alerts', href: '/alerts', icon: 'Bell' },
  { label: 'Reports', href: '/reports', icon: 'FileBarChart' },
] as const;

// ── Report Template Columns (from SUP-5) ──

export const REPORT_COLUMNS = [
  'Aspect de la prestation',
  'Paramètre',
  'Métrique',
  'Limite',
  'Actuel',
] as const;

// ── Pagination ──

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

// ── Date Formats ──

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

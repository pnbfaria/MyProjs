import { PRIORITY_TO_GRAVITY } from './constants';
import type { SlaGravity } from './types';

// ── Configuration ──

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
const JIRA_EMAIL = process.env.JIRA_SERVICE_ACCOUNT || '';
const JIRA_TOKEN = process.env.JIRA_API_TOKEN || '';
const JIRA_SPACE_KEY = process.env.JIRA_SPACE_KEY || 'SUP';

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
}

function getHeaders(): Record<string, string> {
  return {
    Authorization: getAuthHeader(),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function isConfigured(): boolean {
  return Boolean(JIRA_BASE_URL && JIRA_EMAIL && JIRA_TOKEN && !JIRA_TOKEN.startsWith('your-'));
}

// ── Core REST Methods ──

async function jiraFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${JIRA_BASE_URL}/rest/api/3${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jira API ${response.status}: ${body.substring(0, 300)}`);
  }

  return response;
}

// ── Jira Issue Types ──

export interface JiraIssue {
  id: string;
  key: string;
  fields: Record<string, unknown>;
}

export interface JiraSearchResult {
  issues: JiraIssue[];
  isLast: boolean;
  nextPageToken?: string;
}

// ── Search Issues (new /search/jql API) ──

export async function searchIssues(
  jql: string,
  maxResults = 100,
  fields?: string[],
  nextPageToken?: string
): Promise<JiraSearchResult> {
  const body: Record<string, unknown> = {
    jql,
    maxResults,
  };

  if (fields && fields.length > 0) {
    body.fields = fields;
  }

  if (nextPageToken) {
    body.nextPageToken = nextPageToken;
  }

  const response = await jiraFetch('/search/jql', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return response.json();
}

// ── Fetch all issues from configured project ──

const FETCH_FIELDS = [
  'summary', 'description', 'status', 'priority', 'issuetype',
  'created', 'updated', 'resolutiondate', 'reporter', 'assignee',
  'labels', 'timetracking', 'duedate',
  // Custom fields for eSignature (KAN) project
  'customfield_10037',  // Client
  'customfield_10044',  // Requested date
  'customfield_10045',  // Resolved (custom)
  'customfield_10046',  // Acknowledge
  'customfield_10038',  // Namirial Contacted?
];

export async function fetchAllIncidents(): Promise<JiraIssue[]> {
  if (!isConfigured()) {
    throw new Error('Jira is not configured. Set JIRA_BASE_URL, JIRA_SERVICE_ACCOUNT, and JIRA_API_TOKEN in .env.local');
  }

  const jql = `project = "${JIRA_SPACE_KEY}" ORDER BY created DESC`;
  const allIssues: JiraIssue[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const result = await searchIssues(jql, 100, FETCH_FIELDS, nextPageToken);
    allIssues.push(...result.issues);

    if (result.isLast) break;
    nextPageToken = result.nextPageToken;
  } while (nextPageToken);

  return allIssues;
}

// ── Get Single Issue ──

export async function getIncident(issueIdOrKey: string): Promise<JiraIssue> {
  const response = await jiraFetch(`/issue/${issueIdOrKey}`);
  return response.json();
}

// ── Update Issue Field ──

export async function updateIssueField(
  issueIdOrKey: string,
  fieldId: string,
  value: unknown
): Promise<void> {
  await jiraFetch(`/issue/${issueIdOrKey}`, {
    method: 'PUT',
    body: JSON.stringify({
      fields: { [fieldId]: value },
    }),
  });
}

// ── Map Jira Issue → App Ticket Data ──

export interface MappedTicketData {
  jiraKey: string;
  jiraId: string;
  summary: string;
  description: string;
  client: string;
  priority: string;
  gravity: SlaGravity;
  status: string;
  requestedDate: Date;
  acknowledgeDate: Date | null;
  resolvedDate: Date | null;
  reporter: string;
  assignee: string;
  namirialContacted: boolean;
  timeTracking: string | null;
}

function extractText(field: unknown): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>;
    if (obj.name) return String(obj.name);
    if (obj.displayName) return String(obj.displayName);
    if (obj.emailAddress) return String(obj.emailAddress);
    // ADF (Atlassian Document Format)
    if (obj.type === 'doc' && Array.isArray(obj.content)) {
      return extractAdfText(obj);
    }
    if (obj.content && typeof obj.content === 'string') return obj.content;
    if (obj.value) return String(obj.value);
  }
  return String(field);
}

function extractAdfText(adf: Record<string, unknown>): string {
  const parts: string[] = [];
  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (n.type === 'text' && typeof n.text === 'string') {
      parts.push(n.text);
    }
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child);
    }
  }
  walk(adf);
  return parts.join(' ').trim();
}

function extractDate(field: unknown): Date | null {
  if (!field) return null;
  const str = typeof field === 'string' ? field : String(field);
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

export function mapJiraIssue(issue: JiraIssue): MappedTicketData {
  const f = issue.fields;

  const priority = extractText(f.priority);
  const gravity: SlaGravity = PRIORITY_TO_GRAVITY[priority] || 'Mineur';

  // customfield_10044 = "Requested date" — use it if set, otherwise fallback to created
  const requestedDate = extractDate(f.customfield_10044) || extractDate(f.created) || new Date();

  // customfield_10045 = "Resolved" (custom), also check standard resolutiondate
  const resolvedDate = extractDate(f.customfield_10045) || extractDate(f.resolutiondate) || null;

  // customfield_10046 = "Acknowledge"
  const acknowledgeDate = extractDate(f.customfield_10046) || null;

  // customfield_10037 = "Client" (select field with .value)
  const clientField = f.customfield_10037;
  const client = clientField
    ? (typeof clientField === 'object' && clientField !== null
        ? ((clientField as Record<string, unknown>).value as string || extractText(clientField))
        : extractText(clientField))
    : '';

  return {
    jiraKey: issue.key,
    jiraId: issue.id,
    summary: extractText(f.summary),
    description: extractText(f.description),
    client,
    priority,
    gravity,
    status: extractText(f.status),
    requestedDate,
    acknowledgeDate,
    resolvedDate,
    reporter: extractText(f.reporter),
    assignee: extractText(f.assignee) || 'Unassigned',
    namirialContacted: Boolean(f.customfield_10038),
    timeTracking: f.timetracking && Object.keys(f.timetracking as object).length > 0
      ? JSON.stringify(f.timetracking) : null,
  };
}

// ── Check Jira Connection ──

export async function checkConnection(): Promise<{ connected: boolean; method: string; user?: string }> {
  if (!isConfigured()) {
    return { connected: false, method: 'not-configured' };
  }

  try {
    const response = await jiraFetch('/myself');
    const data = await response.json();
    return {
      connected: true,
      method: 'basic',
      user: data.displayName || data.emailAddress || 'unknown',
    };
  } catch (err) {
    return {
      connected: false,
      method: `basic-failed: ${err instanceof Error ? err.message.substring(0, 100) : String(err)}`,
    };
  }
}

// ── Get Available Projects ──

export async function getProjects(): Promise<Array<{ key: string; name: string; id: string }>> {
  try {
    const response = await jiraFetch('/project');
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((p: { key: string; name: string; id: string }) => ({
          key: p.key,
          name: p.name,
          id: p.id,
        }))
      : [];
  } catch {
    return [];
  }
}

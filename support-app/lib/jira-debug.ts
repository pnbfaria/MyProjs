/**
 * Jira connection diagnostic script.
 * Run: npx tsx lib/jira-debug.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
const JIRA_EMAIL = process.env.JIRA_SERVICE_ACCOUNT || '';
const JIRA_TOKEN = process.env.JIRA_API_TOKEN || '';

console.log('=== Jira Debug ===');
console.log('Base URL:', JIRA_BASE_URL);
console.log('Email:', JIRA_EMAIL);
console.log('Token (first 20 chars):', JIRA_TOKEN.substring(0, 20) + '...');

const basicAuth = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
const bearerAuth = `Bearer ${JIRA_TOKEN}`;

async function jiraGet(path: string, useBearer = false) {
  const url = `${JIRA_BASE_URL}/rest/api/3${path}`;
  const authHeader = useBearer ? bearerAuth : basicAuth;
  console.log(`\n>> GET ${url}  [${useBearer ? 'Bearer' : 'Basic'}]`);
  const res = await fetch(url, {
    headers: { Authorization: authHeader, Accept: 'application/json' },
  });
  console.log(`<< Status: ${res.status}`);
  if (!res.ok) {
    const text = await res.text();
    console.log(`<< Body: ${text.substring(0, 300)}`);
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  return data;
}

async function run() {
  // 1. Test auth - try Basic first, then Bearer
  console.log('\n\n--- 1. TESTING AUTH (/myself) ---');
  let useBearer = false;
  try {
    console.log('Trying Basic auth...');
    const myself = await jiraGet('/myself', false);
    console.log('✅ Basic auth works! Authenticated as:', myself.displayName, '|', myself.emailAddress);
  } catch (e) {
    console.log('Basic auth failed, trying Bearer...');
    try {
      const myself = await jiraGet('/myself', true);
      console.log('✅ Bearer auth works! Authenticated as:', myself.displayName, '|', myself.emailAddress);
      useBearer = true;
    } catch (e2) {
      console.error('❌ Both auth methods failed');
      return;
    }
  }

  // 2. List projects
  console.log('\n\n--- 2. PROJECTS ---');
  try {
    const projects = await jiraGet('/project', useBearer);
    if (Array.isArray(projects)) {
      for (const p of projects) {
        console.log(`  ${p.key} — ${p.name} (id: ${p.id})`);
      }
    } else {
      console.log('Projects response:', JSON.stringify(projects).substring(0, 500));
    }
  } catch (e) {
    console.error('Projects error:', e);
  }

  // 3. List issue types for SUP project
  console.log('\n\n--- 3. ISSUE TYPES ---');
  try {
    const types = await jiraGet('/issuetype', useBearer);
    if (Array.isArray(types)) {
      for (const t of types) {
        console.log(`  ${t.name} (id: ${t.id}, subtask: ${t.subtask})`);
      }
    }
  } catch (e) {
    console.error('Issue types error:', e);
  }

  // 4. Search for issues in project
  console.log('\n\n--- 4. SEARCH ISSUES (all types) ---');
  try {
    const jql = 'project = SUP ORDER BY created DESC';
    const searchUrl = `/search?jql=${encodeURIComponent(jql)}&maxResults=5&fields=summary,status,issuetype,priority,created,reporter,assignee`;
    const result = await jiraGet(searchUrl, useBearer);
    console.log(`Total found: ${result.total}`);
    if (result.issues) {
      for (const issue of result.issues) {
        const f = issue.fields;
        console.log(`  ${issue.key} | type:${f.issuetype?.name} | priority:${f.priority?.name} | status:${f.status?.name} | ${f.summary}`);
      }
    }
    if (result.errorMessages) {
      console.log('Errors:', result.errorMessages);
    }
  } catch (e) {
    console.error('Search error:', e);
  }

  // 5. Get all fields to find custom field IDs
  console.log('\n\n--- 5. CUSTOM FIELDS (filtering for likely relevant ones) ---');
  try {
    const fields = await jiraGet('/field', useBearer);
    if (Array.isArray(fields)) {
      const customs = fields.filter((f: any) => f.custom || ['summary', 'description', 'priority', 'status', 'reporter', 'assignee', 'created', 'issuetype', 'timetracking'].includes(f.id));
      for (const f of customs) {
        console.log(`  ${f.id} — "${f.name}" (custom: ${f.custom}, schema: ${f.schema?.type || '?'})`);
      }
    }
  } catch (e) {
    console.error('Fields error:', e);
  }

  // 6. Get one full issue with ALL fields
  console.log('\n\n--- 6. FULL ISSUE DETAIL (first issue) ---');
  try {
    const jql = 'project = SUP ORDER BY created DESC';
    const result = await jiraGet(`/search?jql=${encodeURIComponent(jql)}&maxResults=1`, useBearer);
    if (result.issues && result.issues.length > 0) {
      const issue = result.issues[0];
      console.log(`Issue: ${issue.key}`);
      const fields = issue.fields;
      for (const [key, value] of Object.entries(fields)) {
        const display = value === null ? 'null' : typeof value === 'object' ? JSON.stringify(value).substring(0, 150) : String(value).substring(0, 150);
        console.log(`  ${key}: ${display}`);
      }
    }
  } catch (e) {
    console.error('Detail error:', e);
  }
}

run().catch(console.error);

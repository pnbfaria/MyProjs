import prisma from './prisma';

/**
 * Seeds the database with realistic sample data for development.
 * Run with: npx tsx lib/seed.ts
 */

const CLIENTS = ['Namirial', 'DocuSign', 'HelloSign', 'Adobe Sign'];
const REPORTERS = ['Jean Dupont', 'Marie Martin', 'Pierre Bernard', 'Sophie Laurent'];
const ASSIGNEES = ['Alex Costa', 'Emma Silva', 'Lucas Ferreira', 'Camille Moreau'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 60 * 60 * 1000);
}

interface SeedTicket {
  jiraKey: string;
  jiraId: string;
  summary: string;
  description: string;
  client: string;
  priority: string;
  gravity: string;
  status: string;
  requestedDate: Date;
  acknowledgeDate: Date | null;
  resolvedDate: Date | null;
  reporter: string;
  assignee: string;
  namirialContacted: boolean;
}

const tickets: SeedTicket[] = [
  // ── Majeur incidents ──
  {
    jiraKey: 'ESIG-101', jiraId: '10101',
    summary: 'Signature service completely down for Namirial',
    description: 'All signature requests failing with 503 errors.',
    client: 'Namirial', priority: 'Highest', gravity: 'Majeur',
    status: 'In Progress',
    requestedDate: randomDate(3),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Jean Dupont', assignee: 'Alex Costa',
    namirialContacted: true,
  },
  {
    jiraKey: 'ESIG-102', jiraId: '10102',
    summary: 'Critical: Document validation failing on PDF/A',
    description: 'PDF/A format documents are rejected during signing.',
    client: 'Namirial', priority: 'High', gravity: 'Majeur',
    status: 'In Progress',
    requestedDate: (() => { const d = randomDate(5); return d; })(),
    acknowledgeDate: (() => { const d = randomDate(5); return addHours(d, 0.5); })(),
    resolvedDate: null,
    reporter: 'Marie Martin', assignee: 'Emma Silva',
    namirialContacted: true,
  },
  // ── Significatif incidents ──
  {
    jiraKey: 'ESIG-103', jiraId: '10103',
    summary: 'Timestamp server intermittent failures',
    description: 'TSA endpoint returning timeouts intermittently.',
    client: 'DocuSign', priority: 'Medium', gravity: 'Significatif',
    status: 'Open',
    requestedDate: randomDate(2),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Pierre Bernard', assignee: 'Lucas Ferreira',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-104', jiraId: '10104',
    summary: 'SSO integration broken after IdP update',
    description: 'SAML assertion validation failing after customer IdP certificate renewal.',
    client: 'HelloSign', priority: 'Medium', gravity: 'Significatif',
    status: 'In Progress',
    requestedDate: randomDate(4),
    acknowledgeDate: (() => { const d = randomDate(4); return addHours(d, 2); })(),
    resolvedDate: (() => { const d = randomDate(4); return addHours(d, 5); })(),
    reporter: 'Sophie Laurent', assignee: 'Camille Moreau',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-105', jiraId: '10105',
    summary: 'Webhook delivery delays exceeding 30 minutes',
    description: 'Completion webhooks delayed, causing downstream systems timeout.',
    client: 'Adobe Sign', priority: 'Medium', gravity: 'Significatif',
    status: 'Open',
    requestedDate: randomDate(1),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Jean Dupont', assignee: 'Alex Costa',
    namirialContacted: false,
  },
  // ── Mineur incidents ──
  {
    jiraKey: 'ESIG-106', jiraId: '10106',
    summary: 'UI: Signing page CSS misalignment on Safari',
    description: 'Signature pad not properly centered on Safari mobile.',
    client: 'Namirial', priority: 'Low', gravity: 'Mineur',
    status: 'Open',
    requestedDate: randomDate(10),
    acknowledgeDate: (() => { const d = randomDate(10); return addHours(d, 12); })(),
    resolvedDate: null,
    reporter: 'Marie Martin', assignee: 'Emma Silva',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-107', jiraId: '10107',
    summary: 'Email notification template typo for DocuSign',
    description: 'Customer reported misspelling in the French locale email template.',
    client: 'DocuSign', priority: 'Lowest', gravity: 'Mineur',
    status: 'Resolved',
    requestedDate: randomDate(15),
    acknowledgeDate: (() => { const d = randomDate(15); return addHours(d, 6); })(),
    resolvedDate: (() => { const d = randomDate(15); return addHours(d, 48); })(),
    reporter: 'Pierre Bernard', assignee: 'Lucas Ferreira',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-108', jiraId: '10108',
    summary: 'API: Missing pagination on audit trail endpoint',
    description: 'Audit trail GET endpoint returns max 100 records with no pagination.',
    client: 'HelloSign', priority: 'Low', gravity: 'Mineur',
    status: 'Open',
    requestedDate: randomDate(7),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Sophie Laurent', assignee: 'Camille Moreau',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-109', jiraId: '10109',
    summary: 'Dashboard: Export CSV button unresponsive',
    description: 'CSV export from the admin dashboard produces empty file.',
    client: 'Adobe Sign', priority: 'Low', gravity: 'Mineur',
    status: 'In Progress',
    requestedDate: randomDate(6),
    acknowledgeDate: (() => { const d = randomDate(6); return addHours(d, 24); })(),
    resolvedDate: null,
    reporter: 'Jean Dupont', assignee: 'Alex Costa',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-110', jiraId: '10110',
    summary: 'Signature field auto-detection inconsistent',
    description: 'OCR-based field detection misidentifying date fields as signature fields.',
    client: 'Namirial', priority: 'Medium', gravity: 'Significatif',
    status: 'Open',
    requestedDate: randomDate(1),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Marie Martin', assignee: 'Emma Silva',
    namirialContacted: true,
  },
  {
    jiraKey: 'ESIG-111', jiraId: '10111',
    summary: 'Mobile app crash on large documents',
    description: 'iOS app crashes when loading documents larger than 50MB.',
    client: 'DocuSign', priority: 'High', gravity: 'Majeur',
    status: 'In Progress',
    requestedDate: randomDate(2),
    acknowledgeDate: (() => { const d = randomDate(2); return addHours(d, 0.8); })(),
    resolvedDate: null,
    reporter: 'Pierre Bernard', assignee: 'Lucas Ferreira',
    namirialContacted: false,
  },
  {
    jiraKey: 'ESIG-112', jiraId: '10112',
    summary: 'Batch signing: Rate limit too aggressive',
    description: 'Batch requests hitting 429 errors at 10 req/min, expected 50.',
    client: 'Adobe Sign', priority: 'Low', gravity: 'Mineur',
    status: 'Backlog',
    requestedDate: randomDate(20),
    acknowledgeDate: null,
    resolvedDate: null,
    reporter: 'Sophie Laurent', assignee: '',
    namirialContacted: false,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.syncLog.deleteMany();

  // Insert tickets
  for (const t of tickets) {
    await prisma.ticket.create({ data: t });
  }

  // Create a sync log
  await prisma.syncLog.create({
    data: {
      ticketsProcessed: tickets.length,
      ticketsCreated: tickets.length,
      ticketsUpdated: 0,
      completedAt: new Date(),
      status: 'completed',
    },
  });

  console.log(`✅ Seeded ${tickets.length} tickets`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

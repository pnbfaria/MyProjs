import prisma from './prisma';
import { evaluateSlaStatus, isHorsDelai } from './sla-engine';
import { getCurrentTrimester } from './business-time';
import { SLA_MATRIX, TRIMESTER_LIMITS } from './constants';
import type { ReportData, ReportRow, ReportFilters, SlaGravity } from './types';

/**
 * Report Builder (SUP-5)
 *
 * Aggregates ticket data into the structured SLA report format
 * with columns: Aspect, Paramètre, Métrique, Limite, Actuel.
 */

export async function generateReport(filters: ReportFilters): Promise<ReportData> {
  const { start, end } = getPeriodRange(filters);

  // Fetch tickets in the period, optionally filtered by client
  const where: Record<string, unknown> = {
    requestedDate: {
      gte: start,
      lte: end,
    },
  };

  if (filters.client && filters.client !== 'all') {
    where.client = filters.client;
  }

  const tickets = await prisma.ticket.findMany({ where });

  // Count by gravity
  const majeurs = tickets.filter((t) => t.gravity === 'Majeur');
  const significatifs = tickets.filter((t) => t.gravity === 'Significatif');
  const mineurs = tickets.filter((t) => t.gravity === 'Mineur');

  // Calculate SLA compliance per gravity
  const majeurBreaches = majeurs.filter((t) =>
    isHorsDelai({
      requestedDate: t.requestedDate.toISOString(),
      acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
      resolvedDate: t.resolvedDate?.toISOString() || null,
      gravity: 'Majeur',
    })
  );

  const significatifBreaches = significatifs.filter((t) =>
    isHorsDelai({
      requestedDate: t.requestedDate.toISOString(),
      acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
      resolvedDate: t.resolvedDate?.toISOString() || null,
      gravity: 'Significatif',
    })
  );

  const mineurBreaches = mineurs.filter((t) =>
    isHorsDelai({
      requestedDate: t.requestedDate.toISOString(),
      acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
      resolvedDate: t.resolvedDate?.toISOString() || null,
      gravity: 'Mineur',
    })
  );

  // Build report rows
  const rows: ReportRow[] = [
    // Incident counts
    {
      aspect: 'Incidents',
      parametre: 'Nbre d\'incidents majeurs',
      metrique: 'Nombre',
      limite: `≤ ${TRIMESTER_LIMITS.majeur}`,
      actuel: String(majeurs.length),
      isCompliant: majeurs.length <= TRIMESTER_LIMITS.majeur,
    },
    {
      aspect: 'Incidents',
      parametre: 'Nbre d\'incidents significatifs',
      metrique: 'Nombre',
      limite: `≤ ${TRIMESTER_LIMITS.significatif}`,
      actuel: String(significatifs.length),
      isCompliant: significatifs.length <= TRIMESTER_LIMITS.significatif,
    },
    // Acknowledge SLA (Prise en charge)
    {
      aspect: 'SLA - Prise en charge',
      parametre: 'Incidents Majeurs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Majeur.acknowledge.value}h`,
      actuel: `${majeurBreaches.length} hors délai / ${majeurs.length}`,
      isCompliant: majeurBreaches.length === 0,
    },
    {
      aspect: 'SLA - Prise en charge',
      parametre: 'Incidents Significatifs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Significatif.acknowledge.value}h`,
      actuel: `${significatifBreaches.length} hors délai / ${significatifs.length}`,
      isCompliant: significatifBreaches.length === 0,
    },
    {
      aspect: 'SLA - Prise en charge',
      parametre: 'Incidents Mineurs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Mineur.acknowledge.value}j`,
      actuel: `${mineurBreaches.length} hors délai / ${mineurs.length}`,
      isCompliant: mineurBreaches.length === 0,
    },
    // Response SLA (Délai de réponse)
    {
      aspect: 'SLA - Délai de réponse',
      parametre: 'Incidents Majeurs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Majeur.response.value}h`,
      actuel: `${majeurBreaches.length} hors délai / ${majeurs.length}`,
      isCompliant: majeurBreaches.length === 0,
    },
    {
      aspect: 'SLA - Délai de réponse',
      parametre: 'Incidents Significatifs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Significatif.response.value}h`,
      actuel: `${significatifBreaches.length} hors délai / ${significatifs.length}`,
      isCompliant: significatifBreaches.length === 0,
    },
    {
      aspect: 'SLA - Délai de réponse',
      parametre: 'Incidents Mineurs',
      metrique: 'Délai',
      limite: `≤ ${SLA_MATRIX.Mineur.response.value}j`,
      actuel: `${mineurBreaches.length} hors délai / ${mineurs.length}`,
      isCompliant: mineurBreaches.length === 0,
    },
    // Hors délai
    {
      aspect: 'Performance globale',
      parametre: 'Interventions hors délai',
      metrique: 'Nombre/mois',
      limite: `${TRIMESTER_LIMITS.horsDelaiTarget}`,
      actuel: String(majeurBreaches.length + significatifBreaches.length + mineurBreaches.length),
      isCompliant: (majeurBreaches.length + significatifBreaches.length + mineurBreaches.length) === 0,
    },
  ];

  const compliant = rows.filter((r) => r.isCompliant).length;

  return {
    title: 'Rapport SLA',
    client: filters.client === 'all' ? 'Tous les clients' : filters.client,
    period: filters.periodValue,
    generatedAt: new Date().toISOString(),
    rows,
    summary: {
      totalMetrics: rows.length,
      compliant,
      nonCompliant: rows.length - compliant,
    },
  };
}

// ── Period Parsing ──

function getPeriodRange(filters: ReportFilters): { start: Date; end: Date } {
  if (filters.periodType === 'trimester') {
    // Format: "2026-Q1"
    const [yearStr, qStr] = filters.periodValue.split('-Q');
    const year = parseInt(yearStr);
    const quarter = parseInt(qStr) - 1;
    return {
      start: new Date(year, quarter * 3, 1),
      end: new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999),
    };
  }

  // Month format: "2026-03"
  const [yearStr, monthStr] = filters.periodValue.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

// ── Get Available Clients ──

export async function getClients(): Promise<string[]> {
  const results = await prisma.ticket.findMany({
    select: { client: true },
    distinct: ['client'],
    where: { client: { not: '' } },
    orderBy: { client: 'asc' },
  });
  return results.map((r) => r.client);
}

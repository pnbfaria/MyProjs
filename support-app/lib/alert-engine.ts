import prisma from './prisma';
import { evaluateSlaStatus } from './sla-engine';
import { ALERT_THRESHOLD_PERCENT } from './constants';
import type { SlaGravity } from './types';

/**
 * Alert Engine (SUP-4)
 *
 * Scans tickets approaching SLA deadlines (75% threshold)
 * and creates alert records for those with empty fields.
 */

export interface AlertResult {
  newAlerts: number;
  ticketsScanned: number;
  errors: string[];
}

/**
 * Scan all open tickets for SLA threshold breaches.
 * Creates alerts when:
 * - Acknowledge field is empty AND time elapsed >= 75% of acknowledge SLA
 * - Resolved field is empty AND time elapsed >= 75% of response SLA
 */
export async function scanForAlerts(): Promise<AlertResult> {
  const result: AlertResult = { newAlerts: 0, ticketsScanned: 0, errors: [] };

  try {
    // Fetch tickets that are not yet fully resolved
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { acknowledgeDate: null },
          { resolvedDate: null },
        ],
        status: { notIn: ['Closed', 'Resolved'] },
      },
    });

    result.ticketsScanned = tickets.length;

    for (const ticket of tickets) {
      try {
        const slaStatus = evaluateSlaStatus({
          requestedDate: ticket.requestedDate.toISOString(),
          acknowledgeDate: ticket.acknowledgeDate?.toISOString() || null,
          resolvedDate: ticket.resolvedDate?.toISOString() || null,
          gravity: ticket.gravity as SlaGravity,
        });

        // Check acknowledge threshold
        if (!ticket.acknowledgeDate && slaStatus.acknowledgePercent >= ALERT_THRESHOLD_PERCENT) {
          // Check if alert already exists for this ticket+type
          const existing = await prisma.alert.findFirst({
            where: {
              ticketId: ticket.id,
              type: 'acknowledge',
              acknowledged: false,
            },
          });

          if (!existing) {
            await prisma.alert.create({
              data: {
                ticketId: ticket.id,
                type: 'acknowledge',
                thresholdPercent: Math.round(slaStatus.acknowledgePercent),
                slaDeadline: new Date(slaStatus.acknowledgeDeadline),
                assignee: ticket.assignee,
              },
            });
            result.newAlerts++;
          }
        }

        // Check response threshold
        if (!ticket.resolvedDate && slaStatus.responsePercent >= ALERT_THRESHOLD_PERCENT) {
          const existing = await prisma.alert.findFirst({
            where: {
              ticketId: ticket.id,
              type: 'response',
              acknowledged: false,
            },
          });

          if (!existing) {
            await prisma.alert.create({
              data: {
                ticketId: ticket.id,
                type: 'response',
                thresholdPercent: Math.round(slaStatus.responsePercent),
                slaDeadline: new Date(slaStatus.responseDeadline),
                assignee: ticket.assignee,
              },
            });
            result.newAlerts++;
          }
        }
      } catch (err) {
        result.errors.push(`Error processing ticket ${ticket.jiraKey}: ${err}`);
      }
    }
  } catch (err) {
    result.errors.push(`Alert scan failed: ${err}`);
  }

  return result;
}

/**
 * Get all active (unacknowledged) alerts.
 */
export async function getActiveAlerts() {
  return prisma.alert.findMany({
    where: { acknowledged: false },
    include: { ticket: true },
    orderBy: { triggeredAt: 'desc' },
  });
}

/**
 * Get active alert count for the header badge.
 */
export async function getActiveAlertCount(): Promise<number> {
  return prisma.alert.count({
    where: { acknowledged: false },
  });
}

/**
 * Acknowledge an alert.
 */
export async function acknowledgeAlert(alertId: string) {
  return prisma.alert.update({
    where: { id: alertId },
    data: {
      acknowledged: true,
      acknowledgedAt: new Date(),
    },
  });
}

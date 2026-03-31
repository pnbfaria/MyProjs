import { SLA_MATRIX, PRIORITY_TO_GRAVITY } from './constants';
import { addBusinessTime, getRemainingBusinessMs } from './business-time';
import type { SlaGravity, SlaStatus, SlaStatusLevel, Ticket } from './types';

/**
 * SLA Calculation Engine (SUP-2)
 *
 * Calculates SLA deadlines and evaluates compliance status
 * based on Priority → Gravity mapping and business hours.
 */

// ── Get Gravity from Priority ──

export function getGravity(priority: string): SlaGravity {
  return PRIORITY_TO_GRAVITY[priority] || 'Mineur';
}

// ── Calculate SLA Deadlines ──

export interface SlaDeadlines {
  acknowledgeDeadline: Date;
  responseDeadline: Date;
}

export function calculateDeadlines(requestedDate: Date | string, gravity: SlaGravity): SlaDeadlines {
  const start = typeof requestedDate === 'string' ? new Date(requestedDate) : requestedDate;
  const config = SLA_MATRIX[gravity];

  return {
    acknowledgeDeadline: addBusinessTime(start, config.acknowledge.value, config.acknowledge.unit),
    responseDeadline: addBusinessTime(start, config.response.value, config.response.unit),
  };
}

// ── Evaluate SLA Status Level ──

function evaluateLevel(
  fieldDate: Date | string | null,
  deadline: Date,
  now: Date
): SlaStatusLevel {
  // If field is populated, check if it was within deadline
  if (fieldDate) {
    const populated = typeof fieldDate === 'string' ? new Date(fieldDate) : fieldDate;
    return populated <= deadline ? 'on-track' : 'breached';
  }

  // Field not yet populated — check current time vs deadline
  if (now > deadline) return 'breached';

  // Check if we're past 75% of the window
  const remainingMs = getRemainingBusinessMs(now, deadline);
  const totalMs = getRemainingBusinessMs(
    typeof now === 'object' ? now : new Date(),
    deadline
  );

  // If less than 25% time remaining, it's at-risk
  if (totalMs > 0) {
    const elapsedPercent = ((totalMs - remainingMs) / totalMs) * 100;
    if (elapsedPercent >= 75) return 'at-risk';
  }

  return 'on-track';
}

// ── Full SLA Status Evaluation ──

export function evaluateSlaStatus(
  ticket: Pick<Ticket, 'requestedDate' | 'acknowledgeDate' | 'resolvedDate' | 'gravity'>,
  now: Date = new Date()
): SlaStatus {
  const deadlines = calculateDeadlines(ticket.requestedDate, ticket.gravity as SlaGravity);
  const requestedDate = new Date(ticket.requestedDate);

  const acknowledgeStatus = evaluateLevel(
    ticket.acknowledgeDate,
    deadlines.acknowledgeDeadline,
    now
  );
  const responseStatus = evaluateLevel(
    ticket.resolvedDate,
    deadlines.responseDeadline,
    now
  );

  // Remaining time calculations
  const ackRemainingMs = ticket.acknowledgeDate
    ? 0
    : getRemainingBusinessMs(now, deadlines.acknowledgeDeadline);
  const resRemainingMs = ticket.resolvedDate
    ? 0
    : getRemainingBusinessMs(now, deadlines.responseDeadline);

  // Percent elapsed
  const totalAckMs = getRemainingBusinessMs(requestedDate, deadlines.acknowledgeDeadline);
  const totalResMs = getRemainingBusinessMs(requestedDate, deadlines.responseDeadline);

  const ackElapsed = totalAckMs > 0
    ? Math.min(((totalAckMs - ackRemainingMs) / totalAckMs) * 100, 100)
    : (ticket.acknowledgeDate ? 100 : 0);

  const resElapsed = totalResMs > 0
    ? Math.min(((totalResMs - resRemainingMs) / totalResMs) * 100, 100)
    : (ticket.resolvedDate ? 100 : 0);

  return {
    acknowledge: acknowledgeStatus,
    response: responseStatus,
    acknowledgeDeadline: deadlines.acknowledgeDeadline.toISOString(),
    responseDeadline: deadlines.responseDeadline.toISOString(),
    acknowledgeRemaining: ackRemainingMs,
    responseRemaining: resRemainingMs,
    acknowledgePercent: ticket.acknowledgeDate
      ? (acknowledgeStatus === 'breached' ? 100 : ackElapsed)
      : ackElapsed,
    responsePercent: ticket.resolvedDate
      ? (responseStatus === 'breached' ? 100 : resElapsed)
      : resElapsed,
  };
}

// ── Check if a Ticket is "Hors Délai" ──

export function isHorsDelai(
  ticket: Pick<Ticket, 'requestedDate' | 'acknowledgeDate' | 'resolvedDate' | 'gravity'>
): boolean {
  const status = evaluateSlaStatus(ticket);
  return status.acknowledge === 'breached' || status.response === 'breached';
}

// ── Format Remaining Time ──

export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'BREACHED';

  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

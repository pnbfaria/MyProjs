import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateSlaStatus } from '@/lib/sla-engine';
import { getCurrentTrimester } from '@/lib/business-time';
import { TRIMESTER_LIMITS } from '@/lib/constants';
import type { SlaGravity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const trimester = getCurrentTrimester();

    // Get all tickets in the current trimester
    const tickets = await prisma.ticket.findMany({
      where: {
        requestedDate: {
          gte: trimester.start,
          lte: trimester.end,
        },
      },
    });

    // Count by gravity
    const majeurCount = tickets.filter((t) => t.gravity === 'Majeur').length;
    const significatifCount = tickets.filter((t) => t.gravity === 'Significatif').length;

    // Check SLA breaches
    let acknowledgeBreachCount = 0;
    let responseBreachCount = 0;
    let horsDelaiCount = 0;

    for (const ticket of tickets) {
      const sla = evaluateSlaStatus({
        requestedDate: ticket.requestedDate.toISOString(),
        acknowledgeDate: ticket.acknowledgeDate?.toISOString() || null,
        resolvedDate: ticket.resolvedDate?.toISOString() || null,
        gravity: ticket.gravity as SlaGravity,
      });

      if (sla.acknowledge === 'breached') acknowledgeBreachCount++;
      if (sla.response === 'breached') responseBreachCount++;
      if (sla.acknowledge === 'breached' || sla.response === 'breached') horsDelaiCount++;
    }

    const totalBreachable = tickets.length * 2; // Each ticket has 2 SLA checks
    const totalBreaches = acknowledgeBreachCount + responseBreachCount;
    const compliancePercent = totalBreachable > 0
      ? Math.round(((totalBreachable - totalBreaches) / totalBreachable) * 100)
      : 100;

    return NextResponse.json({
      totalIncidents: tickets.length,
      majeurCount,
      majeurLimit: TRIMESTER_LIMITS.majeur,
      significatifCount,
      significatifLimit: TRIMESTER_LIMITS.significatif,
      horsDelaiCount,
      horsDelaiTarget: TRIMESTER_LIMITS.horsDelaiTarget,
      acknowledgeBreachCount,
      responseBreachCount,
      compliancePercent,
      trimester: trimester.label,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch dashboard stats: ${error}` },
      { status: 500 }
    );
  }
}

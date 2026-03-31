import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getActiveAlerts, getActiveAlertCount, acknowledgeAlert } from '@/lib/alert-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');

    if (countOnly === 'true') {
      const count = await getActiveAlertCount();
      return NextResponse.json({ count });
    }

    const alerts = await getActiveAlerts();

    const mapped = alerts.map((a) => ({
      id: a.id,
      ticketId: a.ticketId,
      ticketKey: a.ticket.jiraKey,
      ticketSummary: a.ticket.summary,
      type: a.type,
      thresholdPercent: a.thresholdPercent,
      slaDeadline: a.slaDeadline.toISOString(),
      assignee: a.assignee,
      triggeredAt: a.triggeredAt.toISOString(),
      acknowledged: a.acknowledged,
      acknowledgedAt: a.acknowledgedAt?.toISOString() || null,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch alerts: ${error}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { alertId } = await request.json();
    if (!alertId) {
      return NextResponse.json({ error: 'alertId required' }, { status: 400 });
    }

    const updated = await acknowledgeAlert(alertId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to acknowledge alert: ${error}` },
      { status: 500 }
    );
  }
}

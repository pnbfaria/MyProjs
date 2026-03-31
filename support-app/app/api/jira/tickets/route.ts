import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateSlaStatus } from '@/lib/sla-engine';
import type { SlaGravity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client');
    const status = searchParams.get('status');
    const gravity = searchParams.get('gravity');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);

    // Build where clause
    const where: Record<string, unknown> = {};
    if (client && client !== 'all') where.client = client;
    if (status && status !== 'all') where.status = status;
    if (gravity && gravity !== 'all') where.gravity = gravity;
    if (search) {
      where.OR = [
        { summary: { contains: search } },
        { jiraKey: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { requestedDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    // Enrich with SLA status
    const enriched = tickets.map((ticket) => {
      const sla = evaluateSlaStatus({
        requestedDate: ticket.requestedDate.toISOString(),
        acknowledgeDate: ticket.acknowledgeDate?.toISOString() || null,
        resolvedDate: ticket.resolvedDate?.toISOString() || null,
        gravity: ticket.gravity as SlaGravity,
      });

      return {
        ...ticket,
        requestedDate: ticket.requestedDate.toISOString(),
        acknowledgeDate: ticket.acknowledgeDate?.toISOString() || null,
        resolvedDate: ticket.resolvedDate?.toISOString() || null,
        lastSyncedAt: ticket.lastSyncedAt.toISOString(),
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        sla,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch tickets: ${error}` },
      { status: 500 }
    );
  }
}

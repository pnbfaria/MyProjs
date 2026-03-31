import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateSlaStatus } from '@/lib/sla-engine';
import type { SlaGravity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { requestedDate: 'asc' },
    });

    // ── 1. Gravity Distribution ──
    const gravityDistribution = [
      { name: 'Majeur', value: 0, color: '#E60012' },
      { name: 'Significatif', value: 0, color: '#F59E0B' },
      { name: 'Mineur', value: 0, color: '#10B981' },
    ];
    tickets.forEach((t) => {
      const entry = gravityDistribution.find((g) => g.name === t.gravity);
      if (entry) entry.value++;
    });

    // ── 2. Status Distribution ──
    const statusMap: Record<string, number> = {};
    tickets.forEach((t) => {
      statusMap[t.status] = (statusMap[t.status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    // ── 3. Client Breakdown ──
    const clientMap: Record<string, { total: number; breached: number }> = {};
    tickets.forEach((t) => {
      const client = t.client || 'Unknown';
      if (!clientMap[client]) clientMap[client] = { total: 0, breached: 0 };
      clientMap[client].total++;

      const sla = evaluateSlaStatus({
        requestedDate: t.requestedDate.toISOString(),
        acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
        resolvedDate: t.resolvedDate?.toISOString() || null,
        gravity: t.gravity as SlaGravity,
      });
      if (sla.acknowledge === 'breached' || sla.response === 'breached') {
        clientMap[client].breached++;
      }
    });
    const clientBreakdown = Object.entries(clientMap)
      .map(([client, data]) => ({
        client,
        total: data.total,
        breached: data.breached,
        compliant: data.total - data.breached,
        complianceRate: data.total > 0
          ? Math.round(((data.total - data.breached) / data.total) * 100)
          : 100,
      }))
      .sort((a, b) => b.total - a.total);

    // ── 4. Monthly Trends ──
    const monthlyMap: Record<string, {
      total: number;
      ackBreached: number;
      resBreached: number;
    }> = {};

    tickets.forEach((t) => {
      const d = new Date(t.requestedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, ackBreached: 0, resBreached: 0 };
      monthlyMap[key].total++;

      const sla = evaluateSlaStatus({
        requestedDate: t.requestedDate.toISOString(),
        acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
        resolvedDate: t.resolvedDate?.toISOString() || null,
        gravity: t.gravity as SlaGravity,
      });
      if (sla.acknowledge === 'breached') monthlyMap[key].ackBreached++;
      if (sla.response === 'breached') monthlyMap[key].resBreached++;
    });

    const monthlyTrends = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const totalChecks = data.total * 2;
        const totalBreaches = data.ackBreached + data.resBreached;
        return {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          totalIncidents: data.total,
          ackCompliance: data.total > 0
            ? Math.round(((data.total - data.ackBreached) / data.total) * 100) : 100,
          resCompliance: data.total > 0
            ? Math.round(((data.total - data.resBreached) / data.total) * 100) : 100,
          overallCompliance: totalChecks > 0
            ? Math.round(((totalChecks - totalBreaches) / totalChecks) * 100) : 100,
        };
      });

    // ── 5. SLA Performance (Acknowledge vs Response breach rates) ──
    let totalAckBreaches = 0;
    let totalResBreaches = 0;
    let totalOnTrack = 0;
    let totalAtRisk = 0;
    let totalBreached = 0;

    tickets.forEach((t) => {
      const sla = evaluateSlaStatus({
        requestedDate: t.requestedDate.toISOString(),
        acknowledgeDate: t.acknowledgeDate?.toISOString() || null,
        resolvedDate: t.resolvedDate?.toISOString() || null,
        gravity: t.gravity as SlaGravity,
      });
      if (sla.acknowledge === 'breached') totalAckBreaches++;
      if (sla.response === 'breached') totalResBreaches++;
      // For counting overall ticket status
      if (sla.acknowledge === 'breached' || sla.response === 'breached') totalBreached++;
      else if (sla.acknowledge === 'at-risk' || sla.response === 'at-risk') totalAtRisk++;
      else totalOnTrack++;
    });

    const slaPerformance = {
      acknowledgeBreachRate: tickets.length > 0
        ? Math.round((totalAckBreaches / tickets.length) * 100) : 0,
      responseBreachRate: tickets.length > 0
        ? Math.round((totalResBreaches / tickets.length) * 100) : 0,
      overallHealth: [
        { name: 'On Track', value: totalOnTrack, color: '#10B981' },
        { name: 'At Risk', value: totalAtRisk, color: '#F59E0B' },
        { name: 'Breached', value: totalBreached, color: '#E60012' },
      ],
    };

    // ── 6. Response Time Analysis (avg days to acknowledge/resolve per gravity) ──
    const responseTimeMap: Record<string, { ackTimes: number[]; resTimes: number[] }> = {
      Majeur: { ackTimes: [], resTimes: [] },
      Significatif: { ackTimes: [], resTimes: [] },
      Mineur: { ackTimes: [], resTimes: [] },
    };

    tickets.forEach((t) => {
      const gravity = t.gravity as string;
      if (!responseTimeMap[gravity]) return;
      const reqDate = new Date(t.requestedDate).getTime();

      if (t.acknowledgeDate) {
        const ackMs = new Date(t.acknowledgeDate).getTime() - reqDate;
        responseTimeMap[gravity].ackTimes.push(ackMs / (1000 * 60 * 60)); // hours
      }
      if (t.resolvedDate) {
        const resMs = new Date(t.resolvedDate).getTime() - reqDate;
        responseTimeMap[gravity].resTimes.push(resMs / (1000 * 60 * 60)); // hours
      }
    });

    const responseTimeAnalysis = Object.entries(responseTimeMap).map(([gravity, data]) => ({
      gravity,
      avgAcknowledgeHours: data.ackTimes.length > 0
        ? Math.round((data.ackTimes.reduce((a, b) => a + b, 0) / data.ackTimes.length) * 10) / 10
        : null,
      avgResolveHours: data.resTimes.length > 0
        ? Math.round((data.resTimes.reduce((a, b) => a + b, 0) / data.resTimes.length) * 10) / 10
        : null,
      ticketCount: gravityDistribution.find((g) => g.name === gravity)?.value || 0,
    }));

    // ── 7. Weekly Volume (last 8 weeks) ──
    const now = new Date();
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
    const weeklyVolume: { week: string; count: number }[] = [];

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(eightWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const count = tickets.filter((t) => {
        const d = new Date(t.requestedDate);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeklyVolume.push({
        week: `W${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        count,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTickets: tickets.length,
        gravityDistribution,
        statusDistribution,
        clientBreakdown,
        monthlyTrends,
        slaPerformance,
        responseTimeAnalysis,
        weeklyVolume,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to generate analytics: ${error}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchAllIncidents, mapJiraIssue, checkConnection } from '@/lib/jira-client';
import { scanForAlerts } from '@/lib/alert-engine';

export const dynamic = 'force-dynamic';

export async function POST() {
  const syncLog = await prisma.syncLog.create({
    data: { status: 'running' },
  });

  try {
    // Check connection first
    const conn = await checkConnection();
    
    if (!conn.connected) {
      // Jira not reachable — run alert scan on existing local data only
      const alertResult = await scanForAlerts();

      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          status: 'completed',
          errors: JSON.stringify([
            'Could not connect to Jira. Ensure API token is valid.',
            'Alert scan completed on local data only.',
          ]),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Jira sync skipped (connection failed). Alert scan completed on local data.',
        alerts: alertResult,
        connection: conn,
      });
    }

    console.log(`[Sync] Connected to Jira as ${conn.user} via ${conn.method}`);

    // Fetch from Jira
    const issues = await fetchAllIncidents();
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const issue of issues) {
      try {
        const mapped = mapJiraIssue(issue);

        const existing = await prisma.ticket.findUnique({
          where: { jiraKey: mapped.jiraKey },
        });

        if (existing) {
          await prisma.ticket.update({
            where: { jiraKey: mapped.jiraKey },
            data: { ...mapped, lastSyncedAt: new Date() },
          });
          updated++;
        } else {
          await prisma.ticket.create({
            data: mapped,
          });
          created++;
        }
      } catch (err) {
        errors.push(`Failed to process ${issue.key}: ${err}`);
      }
    }

    // Run alert scan after sync
    const alertResult = await scanForAlerts();

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        ticketsProcessed: issues.length,
        ticketsCreated: created,
        ticketsUpdated: updated,
        errors: JSON.stringify(errors),
        status: 'completed',
      },
    });

    return NextResponse.json({
      success: true,
      ticketsProcessed: issues.length,
      ticketsCreated: created,
      ticketsUpdated: updated,
      alerts: alertResult,
      errors,
      connection: conn,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        completedAt: new Date(),
        status: 'failed',
        errors: JSON.stringify([errorMsg]),
      },
    });

    return NextResponse.json(
      { success: false, error: `Sync failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}

// GET: Check connection status
export async function GET() {
  try {
    const conn = await checkConnection();
    
    // Get last sync log
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({
      connection: conn,
      lastSync: lastSync ? {
        status: lastSync.status,
        startedAt: lastSync.startedAt.toISOString(),
        completedAt: lastSync.completedAt?.toISOString() || null,
        ticketsProcessed: lastSync.ticketsProcessed,
        ticketsCreated: lastSync.ticketsCreated,
        ticketsUpdated: lastSync.ticketsUpdated,
      } : null,
      config: {
        baseUrl: process.env.JIRA_BASE_URL || 'not set',
        serviceAccount: process.env.JIRA_SERVICE_ACCOUNT ? '***configured***' : 'not set',
        apiToken: process.env.JIRA_API_TOKEN ? '***configured***' : 'not set',
        spaceKey: process.env.JIRA_SPACE_KEY || 'not set',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Connection check failed: ${error}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateReport, getClients } from '@/lib/report-builder';
import type { ReportFilters } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const filters: ReportFilters = await request.json();

    if (!filters.periodValue || !filters.periodType) {
      return NextResponse.json(
        { error: 'periodValue and periodType are required' },
        { status: 400 }
      );
    }

    const report = await generateReport(filters);
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to generate report: ${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json({ success: true, data: { clients } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Failed to fetch report metadata: ${error}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { saveSummary, getSummaries } from '@/lib/summaries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const summary = await saveSummary(body);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error saving summary:', error);
    return NextResponse.json(
      { error: 'Failed to save summary' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const summaries = await getSummaries();
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error getting summaries:', error);
    return NextResponse.json(
      { error: 'Failed to get summaries' },
      { status: 500 }
    );
  }
} 
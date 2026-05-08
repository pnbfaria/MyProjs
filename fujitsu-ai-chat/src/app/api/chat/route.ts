import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, WatsonMessage } from '@/lib/watson';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, threadId } = body as {
      messages: WatsonMessage[];
      threadId?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const response = await chatCompletion(messages, threadId);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

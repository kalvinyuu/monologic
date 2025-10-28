
import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/huggingface';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const response = await chat(message);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching response from Hugging Face' }, { status: 500 });
  }
}

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

// Ensure you have GEMINI_API_KEY set in your environment variables
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: `You are TuneBot, a world-class, professional car tuning expert for the Forza Horizon and Forza Motorsport games.
Your goal is to help players optimize their car setups, choose the best paint colors, and understand telemetry.
Be concise, friendly, and use racing terminology. If a user asks about fixing understeer or oversteer, give them specific, actionable tuning advice (e.g., "stiffen the rear anti-roll bar" or "soften front springs"). 
Keep your responses formatted cleanly with markdown. Use a sleek, professional tone appropriate for a premium racing community called 'The Pit Stop'.`,
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with TuneBot. Please ensure GEMINI_API_KEY is set.' },
      { status: 500 }
    );
  }
}

import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import tuningMeta from '@/app/data/tuning-meta.json';

// Ensure you have GEMINI_API_KEY set in your environment variables
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// Build a concise meta knowledge string from the structured data
function buildMetaKnowledge(): string {
  const lines: string[] = [];

  lines.push('## Current S2/X-Class Competitive Meta (v' + tuningMeta.version + ')');
  lines.push('');

  // Meta tier
  lines.push('### META TIER (Best in class)');
  for (const car of tuningMeta.tiers.meta) {
    lines.push(`- **${car.manufacturer} ${car.car}** (${car.driveMethod}) — ${car.briefReview} Tuners: ${car.adjusters.join(', ') || 'N/A'}`);
  }

  // Sub-meta
  lines.push('');
  lines.push('### SUB-META TIER');
  for (const car of tuningMeta.tiers.sub_meta) {
    lines.push(`- **${car.manufacturer} ${car.car}** (${car.driveMethod}) — ${car.briefReview} Tuners: ${car.adjusters.join(', ') || 'N/A'}`);
  }

  // Competitive
  lines.push('');
  lines.push('### COMPETITIVE TIER');
  for (const car of tuningMeta.tiers.competitive) {
    lines.push(`- **${car.manufacturer} ${car.car}** (${car.driveMethod}) — ${car.briefReview} Tuners: ${car.adjusters.join(', ') || 'N/A'}`);
  }

  // Notable tuners
  lines.push('');
  lines.push('### Notable Community Tuners');
  for (const tuner of tuningMeta.notableTuners) {
    lines.push(`- **${tuner.name}**: ${tuner.specialty}`);
  }

  return lines.join('\n');
}

const metaKnowledge = buildMetaKnowledge();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      // @ts-expect-error - AI SDK version mismatch between 'ai' and '@ai-sdk/google'
      model: google('gemini-1.5-flash'),
      system: `You are TuneBot, a world-class, professional car tuning expert for the Forza Horizon and Forza Motorsport games.
Your goal is to help players optimize their car setups, choose the best paint colors, understand telemetry, and navigate the competitive meta.

You have deep knowledge of the current S2 and X-class competitive meta. When users ask about which cars are best, meta picks, or competitive tuning, reference this data:

${metaKnowledge}

GUIDELINES:
- Be concise, friendly, and use racing terminology.
- If a user asks about fixing understeer or oversteer, give specific, actionable tuning advice (e.g., "stiffen the rear anti-roll bar" or "soften front springs").
- When recommending cars, cite the tier (Meta, Sub-Meta, Competitive) and mention known tuners whose share codes players can search for in-game.
- If asked about a car in the "Good Luck" tier, be honest that it's not competitive but can still be fun.
- Keep responses formatted cleanly with markdown.
- Use a sleek, professional tone appropriate for a premium racing community called 'The Pit Stop'.
- When discussing specific tuners, mention their specialties (e.g., "nyasmowisher is known for handling-focused builds").`,
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

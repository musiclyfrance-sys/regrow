// Client Anthropic partagé (Edge Functions Deno).
// La clé ANTHROPIC_API_KEY est un SECRET Supabase, jamais exposé au client.
// Modèle imposé : claude-sonnet-4-6.

export const MODEL = 'claude-sonnet-4-6';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function callClaude(
  system: string,
  messages: Message[],
  maxTokens = 2048,
): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY manquante');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

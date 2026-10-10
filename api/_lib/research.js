// Company name -> official website + 2-sentence business-model description.
//
// Claude uses the server-side web search / web fetch tools, then returns its
// findings through a strict `report_company` tool so we get structured fields.

import Anthropic from '@anthropic-ai/sdk';
import { tagErrors } from './handler.js';

const MODEL = process.env.MCC_CLAUDE_MODEL || 'claude-opus-5-5';
const MAX_CONTINUATIONS = 4;

const SYSTEM = `You research companies for payment-account onboarding.

Given a company name (and optionally a website), use web search and web fetch to find the company's official website, then read it to understand how the company makes money. If several companies share the name, pick the most prominent one unless the hint says otherwise, and mention the ambiguity in \`notes\`.

When you are done, call the \`report_company\` tool exactly once. The description must be exactly two short sentences of at most 30 words each: the first says what the company primarily sells and to whom; the second says how it charges (e.g. subscription, per-transaction fee, retail sales, advertising, commission) and through which channel (online, in-store, B2B contracts). It feeds a merchant category classifier, so focus on the primary line of business; leave out prices, product names and secondary products. Be concrete and factual; no marketing language. Keep \`notes\` to one sentence, or empty.`;

const REPORT_TOOL = {
  name: 'report_company',
  description: 'Report the researched company profile. Call once, at the end.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['company_name', 'website', 'description', 'notes'],
    properties: {
      company_name: { type: 'string', description: 'Official company name.' },
      website: { type: 'string', description: 'Official homepage URL, e.g. https://stripe.com' },
      description: { type: 'string', description: 'Exactly two sentences on the business model.' },
      notes: { type: 'string', description: 'Ambiguities or caveats; empty string if none.' },
    },
  },
};

const TOOLS = [
  { type: 'web_search_20260209', name: 'web_search', max_uses: 5 },
  { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 3 },
  REPORT_TOOL,
];

export class ResearchError extends Error {}

export async function researchCompany({ name, website, client }) {
  if (!client && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set for this deployment. Add it in Vercel and redeploy.');
  }
  client ??= new Anthropic();
  let prompt = `Company: ${name}`;
  if (website) prompt += `\nWebsite (given by the user, verify it): ${website}`;
  const messages = [{ role: 'user', content: prompt }];

  for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
    const response = await tagErrors('Anthropic', () => client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      tools: TOOLS,
      output_config: { effort: 'medium' },
      // Re-run on a substitute model if a safety classifier declines.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages,
    }));

    const report = response.content.find((b) => b.type === 'tool_use' && b.name === 'report_company');
    if (report) {
      const { company_name, website: site, description, notes } = report.input;
      return { companyName: company_name, website: site, description, notes };
    }

    if (response.stop_reason === 'pause_turn') {
      // Server-tool loop hit its iteration limit; resume where it left off.
      messages.push({ role: 'assistant', content: response.content });
      continue;
    }
    if (response.stop_reason === 'refusal') {
      throw new ResearchError(`Claude declined to research "${name}".`);
    }
    if (response.stop_reason === 'end_turn') {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: 'Call report_company with your findings now.' });
      continue;
    }
    throw new ResearchError(`Research stopped unexpectedly (stop_reason=${response.stop_reason}).`);
  }
  throw new ResearchError(`Research for "${name}" did not finish.`);
}

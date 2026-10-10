// Business description -> MCC, using TypeSafe AI's Jev (System One) model.
//
// Two small requests instead of one huge one (318 codes in a single call ran
// close to the SDK's 10 s default timeout):
//   1. `group`        - which ISO 18245 range the business belongs to
//   2. `mcc__<group>` - for the most likely ranges only, which code fits
// Codes are ranked by P(group) * P(code | group).

import { TypeSafeClient, choice } from '@typesafe-ai/sdk';
import { tagErrors } from './handler.js';
import { CODES_BY_GROUP, GROUPS } from './mcc-codes.js';

export const GROUP_QUESTION = 'group';
export const CODE_PREFIX = 'mcc__';

// Query codes for the top groups until this much probability mass is covered.
const GROUP_MASS = 0.85;
const MAX_GROUPS = 3;

const CLIENT_OPTIONS = {
  timeout: 15_000,
  retry: { maxRetries: 1 },
};

const activeGroups = () => GROUPS.filter((g) => CODES_BY_GROUP[g.key]);

export function buildGroupQuestion() {
  return {
    [GROUP_QUESTION]: choice(
      "Which merchant category group covers this business's primary line of business, i.e. what its customers are actually paying it for?",
      Object.fromEntries(activeGroups().map((g) => [g.key, g.description])),
    ),
  };
}

export function buildCodeQuestions(groupKeys) {
  const questions = {};
  for (const key of groupKeys) {
    const g = GROUPS.find((x) => x.key === key);
    questions[CODE_PREFIX + key] = choice(
      `Assume this business belongs to the group '${g.description}'. Which merchant category code (MCC) best describes its primary line of business?`,
      CODES_BY_GROUP[key],
    );
  }
  return questions;
}

// Most likely groups first, cut off once GROUP_MASS is covered (max MAX_GROUPS).
export function pickGroups(groupProbs) {
  const sorted = Object.entries(groupProbs).sort((a, b) => b[1] - a[1]);
  const picked = [];
  let mass = 0;
  for (const [key, p] of sorted) {
    picked.push(key);
    mass += p;
    if (mass >= GROUP_MASS || picked.length >= MAX_GROUPS) break;
  }
  return picked;
}

const round = (x) => Math.round(x * 10000) / 10000;

export async function classifyMcc({ description, companyName, website, topN = 5, client }) {
  const state = { business_model: description };
  if (companyName) state.company = companyName;
  if (website) state.website = website;

  if (!client && !process.env.TYPESAFE_API_KEY) {
    throw new Error('TYPESAFE_API_KEY is not set for this deployment. Add it in Vercel and redeploy.');
  }
  client ??= new TypeSafeClient(CLIENT_OPTIONS);

  const ask = (questions) => tagErrors('TypeSafe (Jev)', () => client.systemOne({ state, questions }));

  const stage1 = await ask(buildGroupQuestion());
  const groupProbs = stage1.answers[GROUP_QUESTION].probabilities;
  const groupKeys = pickGroups(groupProbs);

  const stage2 = await ask(buildCodeQuestions(groupKeys));

  const ranked = [];
  for (const groupKey of groupKeys) {
    const answer = stage2.answers[CODE_PREFIX + groupKey];
    if (!answer) continue;
    for (const [mcc, pCode] of Object.entries(answer.probabilities)) {
      ranked.push({
        mcc,
        description: CODES_BY_GROUP[groupKey][mcc],
        group: groupKey,
        probability: groupProbs[groupKey] * pCode,
      });
    }
  }
  ranked.sort((a, b) => b.probability - a.probability);

  const [best, ...rest] = ranked;
  return {
    mcc: best.mcc,
    description: best.description,
    confidence: round(best.probability),
    group: best.group,
    groupDescription: GROUPS.find((g) => g.key === best.group).description,
    groupConfidence: round(groupProbs[best.group]),
    alternatives: rest.slice(0, topN - 1).map(({ mcc, description, probability }) => ({
      mcc, description, probability: round(probability),
    })),
    model: stage2.model,
  };
}

// Business description -> MCC, using TypeSafe AI's Jev (System One) model.
//
// Jev answers independent typed questions in one parallel pass, so a single
// request asks:
//   group        - which ISO 18245 range the business belongs to
//   mcc__<group> - for every range, which code fits *if* it were that range
// and codes are ranked by P(group) * P(code | group).

import { TypeSafeClient, choice } from '@typesafe-ai/sdk';
import { CODES_BY_GROUP, GROUPS } from './mcc-codes.js';

const GROUP_QUESTION = 'group';
const CODE_PREFIX = 'mcc__';

export function buildQuestions() {
  const groups = GROUPS.filter((g) => CODES_BY_GROUP[g.key]);
  const questions = {
    [GROUP_QUESTION]: choice(
      "Which merchant category group covers this business's primary line of business, i.e. what its customers are actually paying it for?",
      Object.fromEntries(groups.map((g) => [g.key, g.description])),
    ),
  };
  for (const g of groups) {
    questions[CODE_PREFIX + g.key] = choice(
      `Assume this business belongs to the group '${g.description}'. Which merchant category code (MCC) best describes its primary line of business?`,
      CODES_BY_GROUP[g.key],
    );
  }
  return questions;
}

const round = (x) => Math.round(x * 10000) / 10000;

export async function classifyMcc({ description, companyName, website, topN = 5, client }) {
  const state = { business_model: description };
  if (companyName) state.company = companyName;
  if (website) state.website = website;

  if (!client && !process.env.TYPESAFE_API_KEY) {
    throw new Error('TYPESAFE_API_KEY is not set for this deployment. Add it in Vercel and redeploy.');
  }
  client ??= new TypeSafeClient();
  const response = await client.systemOne({ state, questions: buildQuestions() });
  const answers = response.answers;
  const groupProbs = answers[GROUP_QUESTION].probabilities;

  const ranked = [];
  for (const [groupKey, pGroup] of Object.entries(groupProbs)) {
    const answer = answers[CODE_PREFIX + groupKey];
    if (!answer) continue;
    for (const [mcc, pCode] of Object.entries(answer.probabilities)) {
      ranked.push({ mcc, description: CODES_BY_GROUP[groupKey][mcc], group: groupKey, probability: pGroup * pCode });
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
    model: response.model,
  };
}

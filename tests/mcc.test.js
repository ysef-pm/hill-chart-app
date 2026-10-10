// Offline tests for the MCC Finder functions (TypeSafe + Anthropic mocked).
// Run: npm test

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TypeSafeClient } from '@typesafe-ai/sdk';

import { buildCodeQuestions, buildGroupQuestion, classifyMcc, pickGroups } from '../api/_lib/classify.js';
import { ALL_CODES, CODES_BY_GROUP } from '../api/_lib/mcc-codes.js';
import { researchCompany } from '../api/_lib/research.js';
import research from '../api/mcc/research.js';

test('code table excludes brand block and every code lands in a group', () => {
  assert.ok(ALL_CODES['7372'] && ALL_CODES['5262']);
  assert.ok(!Object.keys(ALL_CODES).some((c) => Number(c) >= 3000 && Number(c) <= 3999));
  const grouped = Object.values(CODES_BY_GROUP).reduce((n, g) => n + Object.keys(g).length, 0);
  assert.equal(grouped, Object.keys(ALL_CODES).length);
});

const jevCalls = [];

function fakeJev(url, init) {
  const body = JSON.parse(init.body);
  jevCalls.push(body);
  assert.equal(new URL(url).pathname, '/v1/systemone');
  assert.match(body.state.business_model, /^Stripe sells/);
  const answers = {};
  for (const [name, q] of Object.entries(body.questions)) {
    const labels = Object.keys(q.criteria);
    const [hot, p] = name === 'group' ? ['business_services', 0.8]
      : name === 'mcc__business_services' ? ['7372', 0.6] : [null, 0];
    const probabilities = Object.fromEntries(labels.map((l) => [
      l, hot ? (l === hot ? p : (1 - p) / (labels.length - 1)) : 1 / labels.length,
    ]));
    const choice = labels.reduce((a, b) => (probabilities[a] >= probabilities[b] ? a : b));
    answers[name] = { type: 'choice', choice, confidence: probabilities[choice], probabilities };
  }
  return Promise.resolve(new Response(
    JSON.stringify({ model: 'jev-test', usage: { input_tokens: 1, output_tokens: 0 }, answers }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ));
}

test('classify asks groups first, then codes for the likely groups only', async () => {
  jevCalls.length = 0;
  const client = new TypeSafeClient({ apiKey: 'test', fetch: fakeJev });
  const r = await classifyMcc({
    description: 'Stripe sells payment APIs to online businesses. It charges a per-transaction fee.',
    companyName: 'Stripe',
    client,
  });
  assert.equal(jevCalls.length, 2);
  assert.deepEqual(Object.keys(jevCalls[0].questions), ['group']);
  const stage2 = Object.keys(jevCalls[1].questions);
  assert.equal(stage2[0], 'mcc__business_services');
  assert.ok(stage2.length <= 3);
  assert.equal(r.mcc, '7372');
  assert.equal(r.group, 'business_services');
  assert.ok(Math.abs(r.confidence - 0.48) < 1e-6);
  assert.equal(r.alternatives.length, 4);
  assert.equal(r.model, 'jev-test');
});

test('pickGroups stops at 85% mass or 3 groups', () => {
  assert.deepEqual(pickGroups({ a: 0.9, b: 0.1 }), ['a']);
  assert.deepEqual(pickGroups({ a: 0.5, b: 0.4, c: 0.1 }), ['a', 'b']);
  assert.deepEqual(pickGroups({ a: 0.3, b: 0.3, c: 0.2, d: 0.2 }), ['a', 'b', 'c']);
});

test('questions are well-formed choices', () => {
  const g = buildGroupQuestion().group;
  assert.deepEqual(Object.keys(g.criteria).sort(), Object.keys(CODES_BY_GROUP).sort());
  const q = buildCodeQuestions(['misc_retail', 'financial']);
  assert.deepEqual(Object.keys(q), ['mcc__misc_retail', 'mcc__financial']);
  assert.equal(Object.keys(q.mcc__misc_retail.criteria).length, Object.keys(CODES_BY_GROUP.misc_retail).length);
});

test('research resumes pause_turn and returns the report tool input', async () => {
  const calls = [];
  const responses = [
    { stop_reason: 'pause_turn', content: [{ type: 'server_tool_use', name: 'web_search' }] },
    {
      stop_reason: 'tool_use',
      content: [{
        type: 'tool_use',
        name: 'report_company',
        input: { company_name: 'Stripe, Inc.', website: 'https://stripe.com', description: 'A. B.', notes: '' },
      }],
    },
  ];
  const client = {
    beta: { messages: { create: async (params) => { calls.push(structuredClone(params)); return responses.shift(); } } },
  };
  const p = await researchCompany({ name: 'Stripe', client });
  assert.deepEqual(p, { companyName: 'Stripe, Inc.', website: 'https://stripe.com', description: 'A. B.', notes: '' });
  assert.equal(calls.length, 2);
  assert.equal(calls[1].messages.at(-1).role, 'assistant');
  assert.equal(calls[0].fallbacks, 'default');
});

function fakeRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    end(body) { this.body = JSON.parse(body); },
  };
}

test('endpoints reject non-POST and unauthenticated requests', async () => {
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  let res = fakeRes();
  await research({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 405);

  res = fakeRes();
  await research({ method: 'POST', headers: {}, body: { name: 'Stripe' } }, res);
  assert.equal(res.statusCode, 401);

  res = fakeRes();
  await research({ method: 'POST', headers: { authorization: 'Bearer not-a-jwt' }, body: { name: 'Stripe' } }, res);
  assert.equal(res.statusCode, 401);
});

test('missing server keys produce a clear error', async () => {
  const saved = { a: process.env.ANTHROPIC_API_KEY, t: process.env.TYPESAFE_API_KEY };
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.TYPESAFE_API_KEY;
  try {
    await assert.rejects(researchCompany({ name: 'x' }), /ANTHROPIC_API_KEY is not set/);
    await assert.rejects(classifyMcc({ description: 'x' }), /TYPESAFE_API_KEY is not set/);
  } finally {
    if (saved.a !== undefined) process.env.ANTHROPIC_API_KEY = saved.a;
    if (saved.t !== undefined) process.env.TYPESAFE_API_KEY = saved.t;
  }
});

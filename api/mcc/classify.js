// POST /api/mcc/classify { description, companyName?, website? }
//   -> { mcc, description, confidence, group, alternatives, ... }

import { classifyMcc } from '../_lib/classify.js';
import { optionalString, postHandler, requireString } from '../_lib/handler.js';

export default postHandler((body) =>
  classifyMcc({
    description: requireString(body, 'description', 2000),
    companyName: optionalString(body, 'companyName', 200),
    website: optionalString(body, 'website'),
  }),
);

// POST /api/mcc/research { name, website? } -> { companyName, website, description, notes }

import { optionalString, postHandler, requireString } from '../_lib/handler.js';
import { researchCompany } from '../_lib/research.js';

export default postHandler((body) =>
  researchCompany({
    name: requireString(body, 'name', 200),
    website: optionalString(body, 'website'),
  }),
);

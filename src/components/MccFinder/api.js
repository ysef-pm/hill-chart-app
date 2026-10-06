// Calls the MCC Finder serverless functions with the user's Firebase ID token.

async function post(user, path, body) {
  const token = await user.getIdToken();
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const researchCompany = (user, { name, website }) =>
  post(user, '/api/mcc/research', { name, website });

export const classifyMcc = (user, { description, companyName, website }) =>
  post(user, '/api/mcc/classify', { description, companyName, website });

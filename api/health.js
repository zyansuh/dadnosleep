/** @param {import('@vercel/node').VercelRequest} _req */
/** @param {import('@vercel/node').VercelResponse} res */
export default function handler(_req, res) {
  return res.status(200).json({ ok: true });
}

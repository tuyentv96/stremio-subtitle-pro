/**
 * Debug endpoint to see what's being received
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    path: req.path || 'N/A'
  });
}

const ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing id' });
  }

  try {
    const response = await fetch(`https://api.abacatepay.com/v2/transparents/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

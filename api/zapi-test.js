const ZAPI_INSTANCE = '3F475FE015C681C6662B424BA5C86D92';
const ZAPI_TOKEN    = 'C25F64EF8C59C0E65B0ED206';
const ZAPI_BASE     = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const phone = req.query.phone || '5518996935542';

  const resp = await fetch(`${ZAPI_BASE}/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client-token': ZAPI_TOKEN,
    },
    body: JSON.stringify({
      phone,
      message: '✅ Teste Z-API funcionando!',
    }),
  });

  const data = await resp.json();
  return res.status(200).json({ httpStatus: resp.status, zapi: data });
}

const ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, email, cellphone } = req.body;

    // customer só é aceito com todos os campos obrigatórios (name, email, taxId, cellphone)
    // como não coletamos name e taxId, guardamos email/telefone nos metadata
    const response = await fetch('https://api.abacatepay.com/v2/transparents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'PIX',
        data: {
          amount,
          description: 'Glacê Espelhado Premium',
          expiresIn: 1800,
          metadata: { email, cellphone: cellphone || '' },
        },
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

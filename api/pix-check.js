const ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne';

// Z-API — substitua pelos seus dados do painel
const ZAPI_INSTANCE = '3F475FE015C681C6662B424BA5C86D92';
const ZAPI_TOKEN    = 'C25F64EF8C59C0E65B0ED206';

// Links do conteúdo — substitua quando tiver os definitivos
const VIDEO_LINK = 'https://www.youtube.com/watch?v=SEU_VIDEO_AQUI';
const PDF_LINK   = 'https://drive.google.com/file/d/SEU_PDF_AQUI/view?usp=sharing';

const ZAPI_BASE = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

async function enviarWhatsApp(phone) {
  // Z-API espera o número no formato DDI+DDD+número, ex: 5511999999999
  const numero = '55' + phone.replace(/\D/g, '');

  const mensagem =
    `🎉 *Pagamento confirmado! Seu acesso ao Glacê Espelhado Premium está liberado.*\n\n` +
    `Aqui estão seus materiais:\n\n` +
    `🎬 *Vídeo Tutorial:*\n${VIDEO_LINK}\n\n` +
    `📄 *PDF - Receita Completa:*\n${PDF_LINK}\n\n` +
    `Qualquer dúvida, é só responder esta mensagem. Boas vendas! ✨`;

  await fetch(`${ZAPI_BASE}/send-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: numero, message: mensagem }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, phone } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing id' });
  }

  try {
    const response = await fetch(`https://api.abacatepay.com/v2/transparents/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` },
    });

    const data = await response.json();

    // Dispara o WhatsApp assim que detectar pagamento — apenas uma vez
    if (data.success && data.data?.status === 'PAID' && phone) {
      await enviarWhatsApp(phone).catch(() => {}); // falha silenciosa para não bloquear resposta
    }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

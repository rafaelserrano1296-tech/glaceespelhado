const ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne';

// Z-API — substitua pelos seus dados do painel
const ZAPI_INSTANCE = '3F475FE015C681C6662B424BA5C86D92';
const ZAPI_TOKEN    = 'C25F64EF8C59C0E65B0ED206';

// Links do conteúdo — substitua quando tiver os definitivos
const VIDEO_LINK = 'https://www.youtube.com/watch?v=4qv1Qgy-xkY';
const PDF_LINK   = 'https://drive.google.com/file/d/1Gr5LsIukyBp-URbGLJ2cryX86s22l0Pk/view?usp=sharing';

const ZAPI_BASE = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

async function enviarWhatsApp(phone) {
  const numero = '55' + phone.replace(/\D/g, '');

  const mensagem =
    `🎉 *Pagamento confirmado! Seu acesso ao Glacê Espelhado Premium está liberado.*\n\n` +
    `Aqui estão seus materiais:\n\n` +
    `🎬 *Vídeo Tutorial:*\n${VIDEO_LINK}\n\n` +
    `📄 *PDF - Receita Completa:*\n${PDF_LINK}\n\n` +
    `Qualquer dúvida, é só responder esta mensagem. Boas vendas! ✨`;

  const resp = await fetch(`${ZAPI_BASE}/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client-token': ZAPI_TOKEN,
    },
    body: JSON.stringify({ phone: numero, message: mensagem }),
  });

  const result = await resp.json();
  console.log('[Z-API] status:', resp.status, 'numero:', numero, 'resp:', JSON.stringify(result));
  return result;
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

    // Sem cache — sempre executa a função
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    // Dispara o WhatsApp assim que detectar pagamento
    let zapiDebug = null;
    if (data.success && data.data?.status === 'PAID' && phone) {
      zapiDebug = await enviarWhatsApp(phone).catch(err => ({ erro: err.message }));
    }

    return res.status(200).json({ ...data, _zapi: zapiDebug });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

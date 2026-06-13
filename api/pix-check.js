const ABACATE_KEY = 'abc_prod_2XBWzZQfCgdjmEasq13NMsne';
const RESEND_KEY  = 're_T4erFEi2_6x8JdFvAxYDBeEaqdjucZE8S';

const VIDEO_LINK = 'https://youtube.com/shorts/gI0RYy-ud2E?feature=share';
const PDF_LINK   = 'https://drive.google.com/file/d/1jQGja3PcmbG9x3vAUqp2yznAmIz2INrX/view?usp=sharing';

async function enviarEmail(email) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Glacê Espelhado Premium <contato@experiencepro.online>',
      to: [email],
      subject: '🎉 Seu acesso ao Glacê Espelhado Premium está liberado!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
          <div style="background:linear-gradient(135deg,#1A1A2E,#2D1B4E);padding:40px 32px;text-align:center;">
            <h1 style="color:#E8C96A;font-size:24px;margin:0 0 8px;">Glacê Espelhado Premium</h1>
            <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px;">Pagamento confirmado com sucesso</p>
          </div>

          <div style="padding:40px 32px;">
            <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">🎉 Parabéns! Seu acesso está liberado.</h2>
            <p style="color:#555;line-height:1.7;margin:0 0 32px;">
              Obrigado pela sua compra! Abaixo estão seus materiais exclusivos do <strong>Glacê Espelhado Premium</strong>.
              Clique nos botões para acessar.
            </p>

            <div style="margin-bottom:16px;">
              <a href="${VIDEO_LINK}"
                 style="display:block;background:linear-gradient(135deg,#E91E8C,#FF4DB8);color:#fff;text-decoration:none;padding:16px 24px;border-radius:12px;font-weight:700;font-size:16px;text-align:center;">
                🎬 Assistir Vídeo Passo a Passo
              </a>
            </div>

            <div style="margin-bottom:32px;">
              <a href="${PDF_LINK}"
                 style="display:block;background:linear-gradient(135deg,#C9A84C,#E8C96A);color:#000;text-decoration:none;padding:16px 24px;border-radius:12px;font-weight:700;font-size:16px;text-align:center;">
                📄 Baixar Ebook Completo
              </a>
            </div>

            <div style="background:#FDF6E3;border-left:4px solid #C9A84C;padding:16px 20px;border-radius:8px;margin-bottom:32px;">
              <p style="margin:0;color:#7A6020;font-size:14px;line-height:1.6;">
                💡 <strong>Dica:</strong> Salve este e-mail para acessar seus materiais a qualquer momento.
              </p>
            </div>

            <p style="color:#888;font-size:13px;text-align:center;margin:0;">
              Qualquer dúvida, responda este e-mail que te ajudamos. Boas vendas! ✨
            </p>
          </div>

          <div style="background:#f5f5f5;padding:20px 32px;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">© 2026 Glacê Espelhado Premium. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
    }),
  });

  const data = await resp.json();
  console.log('[Resend] status:', resp.status, JSON.stringify(data));
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, phone: _phone, email } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing id' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  try {
    const response = await fetch(`https://api.abacatepay.com/v2/transparents/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` },
    });

    const data = await response.json();

    if (data.success && data.data?.status === 'PAID' && email) {
      await enviarEmail(email).catch(err => console.error('[Resend] erro:', err.message));
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

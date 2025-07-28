const express = require('express');
const axios = require('axios');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

// Conectar ao Redis
const redis = createClient({
  url: process.env.REDIS_URL
});
redis.connect();

// Webhook do n8n
const N8N_WEBHOOK_URL = 'https://raphascare.app.n8n.cloud/webhook/e847a7d5-6c4e-46e6-bcb8-63585178efb0';

app.post('/zapi', async (req, res) => {
  const body = req.body;

  // Ignora grupos
  if (body.isGroup === true) {
    console.log('🔁 Mensagem de grupo ignorada');
    return res.status(200).send('Mensagem de grupo ignorada');
  }

  const mensagem = body.body?.toLowerCase() || '';
  const fromMe = body.fromMe === true;

  // Se for a dona
  if (fromMe) {
    if (mensagem === '!pausar') {
      await redis.set('modo_robo', 'pause');
      console.log('⏸️ Bot pausado pela dona');
      return res.status(200).send('Bot pausado');
    }

    if (mensagem === '!continuar') {
      await redis.set('modo_robo', 'play');
      console.log('▶️ Bot ativado pela dona');
      return res.status(200).send('Bot ativado');
    }

    return res.status(200).send('Mensagem da dona ignorada');
  }

  // Se for cliente
  const modo = await redis.get('modo_robo');

  if (modo === 'pause') {
    console.log('⛔ Bot pausado - mensagem ignorada');
    return res.status(200).send('Bot pausado');
  }

  // Modo play - envia pro n8n
  try {
    await axios.post(N8N_WEBHOOK_URL, body);
    console.log('✅ Mensagem enviada ao n8n');
    res.status(200).send('Mensagem enviada');
  } catch (error) {
    console.error('❌ Erro ao enviar:', error.message);
    res.status(500).send('Erro ao enviar ao n8n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Middleware rodando na porta ${PORT}`);
});

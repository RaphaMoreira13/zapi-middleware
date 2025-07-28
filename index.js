const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Coloque aqui a URL do seu webhook do n8n
const N8N_WEBHOOK_URL = 'https://raphascare.app.n8n.cloud/webhook/e847a7d5-6c4e-46e6-bcb8-63585178efb0'; // substitua pelo seu link real

app.post('/zapi', async (req, res) => {
  const body = req.body;

  // Se a mensagem for de grupo, não faz nada
  if (body.isGroup === true) {
    console.log('🔁 Mensagem de grupo ignorada');
    return res.status(200).send('Mensagem de grupo ignorada');
  }

  try {
    // Encaminha para o n8n
    await axios.post(N8N_WEBHOOK_URL, body);
    console.log('✅ Mensagem privada enviada ao n8n');
    res.status(200).send('Mensagem enviada ao n8n');
  } catch (error) {
    console.error('❌ Erro ao enviar para o n8n:', error.message);
    res.status(500).send('Erro ao enviar para o n8n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Middleware rodando na porta ${PORT}`);
});

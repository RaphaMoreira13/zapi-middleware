const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// 👇 Cole aqui a URL do seu Webhook n8n:
const N8N_WEBHOOK_URL = "https://raphascare.app.n8n.cloud/webhook/e847a7d5-6c4e-46e6-bcb8-63585178efb0";

app.post("/zapi", async (req, res) => {
  const from = req.body?.from || req.body?.From || "";
  console.log("Recebido de:", from);

  if (from.includes("@g.us")) {
    console.log("Ignorado (grupo)");
    return res.status(200).send("Grupo ignorado");
  }

  try {
    await axios.post(N8N_WEBHOOK_URL, req.body);
    console.log("Enviado ao n8n");
    res.status(200).send("Encaminhado");
  } catch (err) {
    console.error("Erro ao enviar:", err.message);
    res.status(500).send("Erro");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando na porta", PORT));

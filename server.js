const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  try {
    const firstKey = Object.keys(req.body)[0]; // 💡 Corrige o formato que o BotConversa envia

    if (!firstKey) {
      console.log("❌ Nenhuma chave encontrada no body.");
      return res.status(400).json({ error: "Formato da requisição inválido." });
    }

    let body;
    try {
      body = JSON.parse(firstKey);
    } catch (e) {
      console.log("❌ Falha ao fazer parse da chave:", firstKey);
      return res.status(400).json({ error: "Chave recebida não é um JSON válido." });
    }

    const { mensagem, telefone, canal, vendedora } = body;

    if (!mensagem || !telefone) {
      console.log("❌ mensagem ou telefone ausente:", body);
      return res.status(400).json({ error: "Mensagem ou telefone ausente." });
    }

    // 🎯 Gatilho direto: PRESSÃO ALTA
    if (/press[aã]o alta|hipertens[aã]o|hipertensa/i.test(mensagem)) {
      return res.json({
        modelo_usado: "gpt-4o",
        resposta:
          "Nós também te daremos um acompanhamento com a nossa Doutora, então fique tranquila que você pode tomar o remédio sem ter nenhum efeito colateral pois ele é 100% natural!",
        audio: "audios/rayssa/pressao-alta.mp3",
        remetente: telefone,
        canal,
        vendedora,
      });
    }

    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é uma consultora de vendas empática e profissional. Sempre responda em português com clareza.",
        },
        { role: "user", content: mensagem },
      ],
    };

    const resposta = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const output = resposta.data.choices[0].message.content;

    res.json({
      modelo_usado: "gpt-4o",
      resposta: output,
      remetente: telefone,
      canal,
      vendedora,
    });
  } catch (err) {
    console.error("❌ Erro inesperado:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro interno no servidor da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🚀 Servidor rodando com suporte total ao BotConversa.");
});

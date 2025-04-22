const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("📩 Body recebido:", req.body);
  next();
});
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  try {
    const bodyKeys = Object.keys(req.body);

    if (!bodyKeys.length) {
      console.log("❌ Nenhuma chave recebida no body.");
      return res.status(400).json({ error: "Body mal formatado (nenhuma chave)." });
    }

    const rawEntry = bodyKeys[0]; // Pega a chave que chegou como string gigante

    let parsedRoot;
    try {
      const outerObject = JSON.parse(rawEntry);
      parsedRoot = JSON.parse(outerObject.root);
    } catch (e) {
      console.log("❌ Falha ao fazer double parse:", rawEntry);
      return res.status(400).json({ error: "Não foi possível interpretar o conteúdo do body." });
    }

    const { mensagem, telefone, canal, vendedora } = parsedRoot;

    if (!mensagem || !telefone) {
      console.log("❌ Mensagem ou telefone ausente:", parsedRoot);
      return res.status(400).json({ error: "Mensagem ou telefone ausente." });
    }

    // 🎯 Gatilho PRESSÃO ALTA
    if (/press[aã]o alta|hipertens[aã]o|hipertensa/i.test(mensagem)) {
      console.log("🎯 Ativado: Gatilho PRESSÃO ALTA");
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
          content: "Você é uma consultora de vendas empática. Responda em português com clareza.",
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
    console.error("❌ Erro interno:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro no servidor da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🚀 Servidor rodando — modo compatível BotConversa bugado ativado");
});

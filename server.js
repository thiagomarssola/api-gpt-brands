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
    const keys = Object.keys(req.body);
    const firstKey = keys[0];

    if (!firstKey) {
      console.log("❌ Nenhuma chave no body.");
      return res.status(400).json({ error: "Body inválido." });
    }

    let parsed;
    try {
      parsed = JSON.parse(firstKey);
    } catch (e) {
      console.log("❌ Não foi possível fazer parse da chave:", firstKey);
      return res.status(400).json({ error: "Formato da requisição inválido (chave não parseável)." });
    }

    const { mensagem, telefone, canal, vendedora } = parsed;

    if (!mensagem || !telefone) {
      console.log("❌ Mensagem ou telefone ausente:", parsed);
      return res.status(400).json({ error: "Mensagem ou telefone ausente." });
    }

    // Gatilho: PRESSÃO ALTA
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

    // Fluxo padrão com IA
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é uma consultora de vendas empática e profissional. Sempre responda em português.",
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
    res.status(500).json({ error: "Erro interno no servidor da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("🚀 Servidor rodando com parse forçado do BotConversa bugado");
});

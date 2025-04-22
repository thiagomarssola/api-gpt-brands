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
    const firstKey = Object.keys(req.body)[0];
    const parsed = JSON.parse(firstKey);
    const rawBody = parsed.root;

    if (!rawBody) {
      return res.status(400).json({ error: "Body.root ausente ou mal formatado." });
    }

    const body = JSON.parse(rawBody);
    const { mensagem, telefone, canal, vendedora } = body;

    // 👇 Gatilho direto para PRESSÃO ALTA
    if (/press[aã]o alta|hipertens[aã]o|hipertensa/i.test(mensagem)) {
      return res.json({
        modelo_usado: "gpt-4o",
        resposta: "Nós também te daremos um acompanhamento com a nossa Doutora, então fique tranquila que você pode tomar o remédio sem ter nenhum efeito colateral pois ele é 100% natural!",
        audio: "audios/rayssa/pressao-alta.mp3",
        remetente: telefone,
        canal,
        vendedora
      });
    }

    // Se não bater no gatilho, segue com IA normal
    const payload = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é uma consultora de vendas empática e profissional. Sempre responda em português com clareza." },
        { role: "user", content: mensagem }
      ]
    };

    const resposta = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const output = resposta.data.choices[0].message.content;

    res.json({
      modelo_usado: "gpt-4o",
      resposta: output,
      remetente: telefone,
      canal,
      vendedora
    });
  } catch (err) {
    console.error("Erro detalhado:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar resposta da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

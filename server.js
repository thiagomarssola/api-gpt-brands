const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para log
app.use((req, res, next) => {
  console.log("📩 Body recebido:", req.body);
  next();
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  try {
    let rawRoot;

    // Detecta se está vindo no formato bugado
    const chaveBugada = Object.keys(req.body)[0];
    if (chaveBugada && chaveBugada.includes("root")) {
      rawRoot = JSON.parse(chaveBugada)["root"];
    } else {
      rawRoot = req.body.root;
    }

    if (!rawRoot || typeof rawRoot !== "string") {
      return res.status(400).json({ error: "Campo root ausente ou mal formatado." });
    }

    const { mensagem, telefone, canal, vendedora } = JSON.parse(rawRoot);

    if (!mensagem || !telefone) {
      return res.status(400).json({ error: "Mensagem ou telefone ausente." });
    }

    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é uma consultora de vendas empática e profissional. Sempre responda em português de forma clara e objetiva.",
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

    // Gatilho personalizado PRESSÃO ALTA
    let audio = null;
    if (mensagem.toLowerCase().includes("pressão alta")) {
      console.log("🎯 Ativado: Gatilho PRESSÃO ALTA");
      audio = "audios/rayssa/pressao-alta.mp3";
    }

    res.json({
      modelo_usado: "gpt-4o",
      resposta: output,
      audio,
      remetente: telefone,
      canal,
      vendedora,
    });
  } catch (err) {
    console.error("❌ Erro detalhado:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar resposta da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

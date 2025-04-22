const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Middleware para corrigir formato bugado do BotConversa
app.use((req, res, next) => {
  try {
    // 📥 Captura o body bruto vindo com chave anômala
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length === 1 && bodyKeys[0].includes("root")) {
      const rawString = bodyKeys[0];
      const jsonParsed = JSON.parse(rawString);
      req.body = JSON.parse(jsonParsed.root);
      console.log("📩 root corrigido do formato bugado:", req.body);
    } else if (typeof req.body.root === "string") {
      req.body = JSON.parse(req.body.root);
      console.log("📩 root parseado (formato normal):", req.body);
    } else {
      console.log("📩 Body sem root:", req.body);
    }
    next();
  } catch (err) {
    console.error("❌ Erro ao processar root:", err.message);
    return res.status(400).json({ error: "Body.root inválido ou ausente." });
  }
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  try {
    const { mensagem, telefone, canal, vendedora } = req.body;

    if (!mensagem || !telefone) {
      console.log("❌ mensagem ou telefone ausente:", req.body);
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

    // Gatilho PRESSÃO ALTA com áudio
    let audio = null;
    if (mensagem.toLowerCase().includes("pressão alta") || mensagem.toLowerCase().includes("pressao alta")) {
      console.log("🎯 Ativado: Gatilho PRESSÃO ALTA");
      audio = "audios/rayssa/pressao-alta.mp3";
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      modelo_usado: "gpt-4o",
      resposta: output,
      audio,
      remetente: telefone,
      canal,
      vendedora
    });

  } catch (err) {
    console.error("❌ Erro no processamento final:", err.response?.data || err.message);
    return res.status(500).json({ error: "Erro ao gerar resposta da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});

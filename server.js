const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  const { mensagem, telefone, canal, vendedora } = req.body;

  const slug = mensagem.toLowerCase();
  const palavrasChave = [
    { chave: "pressão alta", arquivo: "pressao-alta.mp3" },
    { chave: "pressao alta", arquivo: "pressao-alta.mp3" }
  ];

  let audioEncontrado = null;
  for (const item of palavrasChave) {
    if (slug.includes(item.chave)) {
      const audioPath = path.join(__dirname, "audios", vendedora, item.arquivo);
      if (fs.existsSync(audioPath)) {
        audioEncontrado = `/audios/${vendedora}/${item.arquivo}`;
        break;
      }
    }
  }

  if (audioEncontrado) {
    return res.json({
      resposta: `[AUDIO] ${audioEncontrado}`,
      remetente: telefone,
      canal,
      vendedora
    });
  }

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Você é uma consultora de vendas empática e profissional. Responda com clareza e educação dúvidas sobre o uso do produto." },
      { role: "user", content: mensagem }
    ]
  };

  try {
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
      resposta: output,
      remetente: telefone,
      canal,
      vendedora
    });
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: "Erro ao gerar resposta da IA." });
  }
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

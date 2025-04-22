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
    console.log("📩 req.body recebido:", req.body);

    // Captura a primeira chave malformada
    const firstKey = Object.keys(req.body)[0];

    if (!firstKey) {
      console.log("❌ Body malformado, nenhuma chave válida.");
      return res.status(400).json({ error: "Requisição malformada." });
    }

    // Tenta fazer o parse do conteúdo da chave
    const bodyParsed = JSON.parse(firstKey);

    const rawBody = bodyParsed.root;

    if (!rawBody) {
      console.log("❌ Campo 'root' ausente no JSON da chave malformada.");
      return res.status(400).json({ error: "Campo 'root' não encontrado." });
    }

    const body = JSON.parse(rawBody);

    const { mensagem, telefone, canal, vendedora } = body;

    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é uma consultora de vendas empática e profissional. Sempre responda em português de forma clara e objetiva.",
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
    console.error("❌ Erro detalhado:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar resposta da IA." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

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
    // Ajuste aqui: extrai a string do root e faz parse do JSON válido
    const rawBody = req.body.root;
    const body = JSON.parse(rawBody); // isso transforma a string JSON em objeto

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
    console.error("Erro detalhado:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Erro ao gerar resposta da IA. Verifique o corpo da requisição." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/responder", async (req, res) => {
  app.post("/responder", async (req, res) => {
  try {
    console.log("📩 req.body:", req.body);

    const rawBody = req.body.root;

    if (!rawBody) {
      console.log("❌ Campo 'root' ausente ou vazio!");
      return res.status(400).json({ error: "Body.root ausente ou mal formatado." });
    }

    const body = JSON.parse(rawBody); // transforma o JSON string em objeto

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
 = body;

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

app.post("/responder", async (req, res) => {
  try {
    const raw = req.body?.root;

    if (!raw || typeof raw !== "string") {
      console.log("❌ root ausente ou não é string:", raw);
      return res.status(400).json({ error: "Body.root ausente ou mal formatado." });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      console.log("❌ JSON inválido no root:", raw);
      return res.status(400).json({ error: "Body.root não é um JSON válido." });
    }

    const { mensagem, telefone, canal, vendedora } = body;

    if (!mensagem || !telefone) {
      console.log("❌ mensagem ou telefone ausente:", body);
      return res.status(400).json({ error: "Mensagem ou telefone ausente." });
    }

    // 👇 Gatilho PRESSÃO ALTA
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

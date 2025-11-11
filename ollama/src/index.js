import express from "express";
import { Ollama } from "ollama";

const app = express();
app.use(express.json());

const client = new Ollama({ host: "http://127.0.0.1:11434" });

/**
 * Basic chat endpoint
 * POST /chat
 */
app.post("/chat", async (req, res) => {
  try {
    const { messages, model = "llama3.2" } = req.body;

    const response = await client.chat({
      model,
      messages,
    });

    res.json({
      reply: response.message.content,
    });
  } catch (err) {
    console.log("Error occured:", err)
    res.status(500).json({ error: String(err) });
  }
});

/**
 * Streaming chat endpoint (Server-Sent Events)
 * POST /chat/stream
 */
app.post("/chat/stream", async (req, res) => {
  try {
    const { messages, model = "llama3.2" } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders();

    const stream = await client.chat({
      model,
      messages,
      stream: true,
    });

    for await (const part of stream) {
      const delta = part.message?.content ?? "";
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    res.write(`event: done\ndata: {}\n\n`);
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`);
    res.end();
  }
});

/**
 * Embedding endpoint
 * POST /embed
 */
// app.post("/embed", async (req, res) => {
//   try {
//     const { input, model = "mxbai-embed-large" } = req.body;

//     const response = await client.embeddings({
//       model,
//       input,
//     });

//     const vector = response.embeddings?.[0] || response.embeddings || [];

//     res.json({
//       vector
//     });
//   } catch (err) {
//     res.status(500).json({ error: String(err) });
//   }
// });

app.post("/embed", async (req, res) => {
  try {
    const { input, model = "mxbai-embed-large" } = req.body;

    const response = await client.embeddings({
      model,
      input,
    });

    // Ollama embeddings API returns an array of embeddings
    const vector = response.embeddings?.[0] || response.embedding || [];

    res.json({ vector });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});




app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});

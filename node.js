const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

// Simpan API key di server, jangan di frontend!
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; // Ganti dengan API key-mu

app.use(express.json());
app.use(express.static('.')); // supaya index.html bisa diakses

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ error: "No message" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu adalah asisten AI yang membantu pengguna." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running di http://localhost:${PORT}`);
});
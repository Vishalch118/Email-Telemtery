const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

/* Groq client */
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* Detect automated emails */
function isAutomatedEmail(subject, body) {
  const text = (subject + " " + body).toLowerCase();

  const keywords = [
    "verify",
    "login",
    "alert",
    "notification",
    "job alert",
    "sip",
    "fund",
    "units allocated",
    "newsletter",
    "update",
    "no-reply",
    "noreply"
  ];

  return keywords.some(keyword => text.includes(keyword));
}

router.post("/reply", async (req, res) => {
  try {
    const { subject, body } = req.body;

    const trimmedBody = body ? body.slice(0, 1000) : "";

    /* Skip automated emails */
    if (isAutomatedEmail(subject, trimmedBody)) {
      return res.json({
        reply: "No reply needed for this automated email."
      });
    }

    const prompt = `
You are writing an email reply as Vishal.

Rules:
- Reply as the recipient of the email
- Write ONLY the reply email
- Do NOT explain anything
- Do NOT generate multiple options
- Keep the reply short (2-4 sentences)
- Maintain a polite professional tone

Email Subject:
${subject}

Email Content:
${trimmedBody}

Write the reply now.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional email assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    const reply = completion?.choices?.[0]?.message?.content || "No reply generated.";

    res.json({ reply });

  } catch (err) {
    console.error("Groq AI Error:", err.response?.data || err.message || err);
    res.status(500).json({
      error: "AI reply generation failed"
    });
  }
});

module.exports = router;
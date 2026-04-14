const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

/* Groq client */
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* Detect automated emails */
function isAutomatedEmail(subject = "", body = "") {
  const text = (subject + " " + body).toLowerCase();

  const keywords = [
    "verify",
    "login",
    "alert",
    "notification",
    "job alert",
    "newsletter",
    "update",
    "no-reply",
    "noreply",
    "otp",
    "password",
    "subscription",
    "receipt",
    "invoice"
  ];

  return keywords.some(keyword => text.includes(keyword));
}

router.post("/reply", async (req, res) => {
  try {
    const { subject, body, from } = req.body;

    if (!body || body.trim().length < 10) {
      return res.json({
        reply: "Not enough content to generate a meaningful reply."
      });
    }

    const trimmedBody = body.slice(0, 1200);

    /* Skip automated emails */
    if (isAutomatedEmail(subject, trimmedBody)) {
      return res.json({
        reply: "No reply needed for this automated or system-generated email."
      });
    }

    const prompt = `
You are writing a real human email reply.

Rules:
- Write naturally like a real person (not a template)
- Do NOT include placeholders like [Your Name]
- Do NOT include unnecessary greetings like "Dear Sir/Madam"
- Keep it short (2–4 sentences)
- Be polite and professional
- Make it sound conversational, not robotic
- Only output the reply text

Email:
From: ${from || "Unknown"}
Subject: ${subject || "No Subject"}

Content:
${trimmedBody}

Write the reply now.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a professional email reply assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "No reply generated.";

    res.json({ reply });

  } catch (err) {
    console.error("Groq AI Error:", err.response?.data || err.message || err);

    res.status(500).json({
      error: "AI reply generation failed"
    });
  }
});

module.exports = router;
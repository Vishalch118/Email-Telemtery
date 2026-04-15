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
    const { subject = "", body = "", from = "" } = req.body;

    // ✅ Always create usable content
    let content = body?.trim();

    if (!content || content.length < 20) {
      content = `Subject: ${subject}`;
    }

    const trimmedBody = content.slice(0, 1200);

    const DEMO_MODE = false;

    if (!DEMO_MODE && isAutomatedEmail(subject, trimmedBody)) {
      return res.json({
        reply: "No reply needed for this automated or system-generated email."
      });
    }

    const prompt = `
Write a natural human reply to the following email.

Rules:
- Keep it short (2–4 sentences)
- Be polite and professional
- Sound natural (not robotic)
- Do NOT use placeholders
- Do NOT include subject line
- Do NOT include signature
- Reply as the recipient of the email.
- Write ONLY the reply email. 
- Do NOT explain anything. 
- Do NOT generate multiple options. 
- Do NOT include placeholders like [Name]. 
- Keep the reply short (2-4 sentences). 
- Maintain a polite and professional tone.
- DO NOT sound sorry or Arrogant. Just be natural.

Email:
From: ${from || "Unknown"}
Subject: ${subject || "No Subject"}

Content:
${trimmedBody}

Reply:
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You write concise, natural, human-like email replies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 200
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Could not generate reply.";

    res.json({ reply });

  } catch (err) {
    console.error("Groq AI Error:", err.response?.data || err.message || err);

    res.status(500).json({
      error: "AI reply generation failed"
    });
  }
});

module.exports = router;
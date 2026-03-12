const express = require("express");

const router = express.Router();

/*
  Detect automated / notification emails
  These usually should NOT receive replies
*/
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

    // Limit email size sent to AI
    const trimmedBody = body ? body.slice(0, 1000) : "";

    // Skip automated emails
    if (isAutomatedEmail(subject, trimmedBody)) {
      return res.json({
        reply: "No reply needed for this automated email."
      });
    }

    const prompt = `
You are writing an email reply as Vishal.

Rules:
- Reply as the recipient of the email.
- Write ONLY the reply email.
- Do NOT explain anything.
- Do NOT generate multiple options.
- Do NOT include placeholders like [Name].
- Keep the reply short (2-4 sentences).
- Maintain a polite and professional tone.

Email Subject:
${subject}

Email Content:
${trimmedBody}

Write the reply now.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma3:1b",
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      reply: data.response
    });

  } catch (err) {
    console.error("AI Reply Error:", err);
    res.status(500).json({
      error: "AI reply generation failed"
    });
  }
});

module.exports = router;
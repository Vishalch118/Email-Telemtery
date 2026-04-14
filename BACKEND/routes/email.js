const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { getClient } = require("../utils/googleAuth");
const Email = require("../models/Email");

// GET /emails (from Gmail directly)
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userEmail = req.headers["x-user-email"]; // ✅ must be inside route

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    if (!userEmail) {
      return res.status(400).json({ error: "Missing user email" });
    }

    const oauth2Client = await getClient();
    oauth2Client.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
    });

    const messages = await Promise.all(
      (response.data.messages || []).map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });

        const headers = detail.data.payload.headers;

        const getHeader = (name) =>
          headers.find((h) => h.name === name)?.value;

        return {
          gmailId: msg.id,
          userEmail, // ✅ link to user
          subject: getHeader("Subject"),
          from: getHeader("From"),
          to: getHeader("To"),
          date: new Date(getHeader("Date")),
          snippet: detail.data.snippet,
          body: "",
        };
      })
    );

    // ✅ Send response immediately (FAST)
    res.json(messages);

    // ⚡ Background DB save (NON-BLOCKING)
    (async () => {
      try {
        const bulkOps = messages.map((email) => ({
          updateOne: {
            filter: {
              gmailId: email.gmailId,
              userEmail: email.userEmail,
            },
            update: email,
            upsert: true,
          },
        }));

        await Email.bulkWrite(bulkOps);

        console.log("✅ Emails stored in DB");
      } catch (err) {
        console.error("DB save error:", err.message);
      }
    })();

  } catch (err) {
    console.error("Email fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

module.exports = router;
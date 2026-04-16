const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { getClient } = require("../utils/googleAuth");
const Email = require("../models/Email");
const redisClient = require("../redisClient");

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const userEmail = req.headers["x-user-email"];

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    if (!userEmail) {
      return res.status(400).json({ error: "Missing user email" });
    }

    const cacheKey = `emails:${userEmail}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {}

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
          userEmail,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          to: getHeader("To"),
          date: new Date(getHeader("Date")),
          snippet: detail.data.snippet,
          body: "",
        };
      })
    );

    res.json(messages);

    (async () => {
      try {
        await redisClient.setEx(
          cacheKey,
          60,
          JSON.stringify(messages)
        );
      } catch (err) {}

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
      } catch (err) {}
    })();

  } catch (err) {
    console.error("Email fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

module.exports = router;
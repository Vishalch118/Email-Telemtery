require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { google } = require("googleapis");
const mongoose = require("mongoose");
const { convert } = require("html-to-text");

const emailRoutes = require("./routes/email");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai.js");
const connectDB = require("./db");
const Email = require("./models/Email");

const PORT = process.env.PORT || 3000;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly"
];

const app = express();

app.use(express.json());
app.use(cors());

app.use("/analytics", analyticsRoutes);
app.use("/emails", emailRoutes);
app.use("/ai", aiRoutes);

// ================= DB =================
connectDB();
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

// ================= GOOGLE AUTH =================
const credentials = require("./credentials.json");
const { client_id, client_secret } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret
);

// ✅ USE REFRESH TOKEN FROM ENV
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

console.log("✅ Using refresh token from env");

// ================= EMAIL FETCH =================
async function fetchEmails() {
  try {
    console.log("📥 Fetching emails...");

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    let nextPageToken = null;
    let totalFetched = 0;

    do {
      const res = await gmail.users.messages.list({
        userId: "me",
        maxResults: 20,
        pageToken: nextPageToken,
      });

      const messages = res.data.messages || [];

      for (let msg of messages) {
        const msgData = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });

        const headers = msgData.data.payload.headers;

        const subject = headers.find(h => h.name === "Subject")?.value;
        const from = headers.find(h => h.name === "From")?.value;
        const to = headers.find(h => h.name === "To")?.value;
        const rawDate = headers.find(h => h.name === "Date")?.value;
        const date = rawDate ? new Date(rawDate) : null;

        let body = "";

        if (msgData.data.payload.parts) {
          const part = msgData.data.payload.parts.find(
            p => p.mimeType === "text/plain"
          );

          if (part?.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
            body = convert(body);
          }
        }

        await Email.updateOne(
          { gmailId: msg.id },
          {
            gmailId: msg.id,
            subject,
            from,
            to,
            date,
            snippet: msgData.data.snippet,
            body,
          },
          { upsert: true }
        );

        console.log("Stored:", subject);

        totalFetched++;
        if (totalFetched >= 20) break;
      }

      nextPageToken = res.data.nextPageToken;

    } while (nextPageToken && totalFetched < 20);

    console.log("✅ Emails fetched:", totalFetched);

  } catch (err) {
    console.error("❌ Error fetching emails:", err.message);
  }
}

// ================= AUTO SYNC =================

// Run once at startup
fetchEmails();

// Run every 5 minutes
setInterval(() => {
  fetchEmails();
}, 5 * 60 * 1000);

// ================= START =================
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});
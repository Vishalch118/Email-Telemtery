require("dotenv").config();

const cors = require("cors");
const fs = require("fs");
const express = require("express");
const readline = require("readline");
const { google } = require("googleapis");
const emailRoutes = require("./routes/email");
const connectDB = require("./db");
const Email = require("./models/Email");
const analyticsRoutes = require("./routes/analytics");
const mongoose = require('mongoose')
const aiRoutes = require("./routes/ai.js");
const PORT = process.env.PORT || 3000;
const { convert } = require("html-to-text");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly"
];

const app = express();

app.use(express.json());
app.use(cors())
app.use("/analytics", analyticsRoutes);
app.use("/emails", emailRoutes);
app.use("/ai", aiRoutes);
const TOKEN_PATH = process.env.TOKEN_PATH;

connectDB();
mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
});
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    fetchEmails();
} else {
    getNewToken();
}

function getNewToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log("Authorize this app:", authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter code: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error("Token error", err);
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            fetchEmails();
        });
    });
}

async function fetchEmails() {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    let nextPageToken = null;
    let totalFetched = 0;

    do {
        const res = await gmail.users.messages.list({
            userId: "me",
            maxResults: 50,
            pageToken: nextPageToken
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
            const rawDate = headers.find(h => h.name === "Date")?.value;
            const date = rawDate ? new Date(rawDate) : null;
            const to = headers.find(h => h.name === "To")?.value;

            let body = "";

            if (msgData.data.payload.parts) {
                const part = msgData.data.payload.parts.find(
                    p => p.mimeType === "text/plain"
                );

                if (part && part.body.data) {
                    body = Buffer.from(part.body.data, "base64").toString("utf-8");
                    body = convert(body, {
                        wordwrap: 130
                    });
                }
            } else if (msgData.data.payload.body.data) {
                body = Buffer.from(
                    msgData.data.payload.body.data,
                    "base64"
                ).toString("utf-8");

                body = convert(body, {
                    wordwrap: 130
                });
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
                    body
                },
                { upsert: true }
            );

            console.log("Stored:", subject);

            totalFetched++;

            if (totalFetched >= 50) break;
        }

        nextPageToken = res.data.nextPageToken;

    } while (nextPageToken && totalFetched < 50); // limit for safety

    console.log("Total emails processed:", totalFetched);
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
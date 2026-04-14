const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokens, getUserInfo } = require('../utils/googleAuth');

// Step 1: Get login URL
router.get('/url', async (req, res) => {
    try {
        const url = await getAuthUrl();
        res.json({ url });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Step 2: Handle callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const tokens = await getTokens(code);
        const userInfo = await getUserInfo(tokens.access_token);

        // Redirect to frontend
        const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

        const frontendUrl = `${baseUrl}?auth_success=true&access_token=${tokens.access_token}&email=${userInfo.email}`;

        res.redirect(frontendUrl);

    } catch (err) {
        console.error(err);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
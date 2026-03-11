const express = require("express");
const router = express.Router();
const Email = require("../models/Email");

/*
GET /emails
Returns latest emails from database
*/
router.get("/", async (req, res) => {
  try {
    const emails = await Email.find()
      .sort({ date: -1 })   // newest first
      .limit(50);           // limit results

    res.json(emails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emails" });
  }
});

module.exports = router;
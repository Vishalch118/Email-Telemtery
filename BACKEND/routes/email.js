const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const redisClient = require("../redisClient");

/*
GET /emails
Returns latest emails from database
*/
router.get("/", async (req, res) => {
  try { //checks redis cache first .
    const cache = await redisClient.get("emails");

    if (cache) {
      console.log("Cache HIT");
      return res.json(JSON.parse(cache));

      Email.find()
        .sort({ date: -1 })
        .limit(50)
        .then((emails) => {
          redisClient.setEx("emails", 300, JSON.stringify(emails));
          console.log("🔄 Cache refreshed in background");
        })
        .catch(console.error);

      return;
    }

    console.log("Cache MISS");

    const emails = await Email.find()
      .sort({ date: -1 })   // newest first
      .limit(50);           // limit results

      //stores in redis for 5 mins (300 secs)
      await redisClient.setEx("emails", 300, JSON.stringify(emails));

    res.json(emails);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching emails" });
  }
});

module.exports = router;
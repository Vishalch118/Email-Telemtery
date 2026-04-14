const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const redisClient = require("../redisClient");
const getOrSetCache = require("../utils/cache");

// ================= BASIC =================
router.get("/", async (req, res) => {
  try {
    const userEmail = req.headers["x-user-email"];

    if (!userEmail) {
      return res.status(400).json({ error: "Missing user email" });
    }

    const totalEmails = await Email.countDocuments({ userEmail });

    res.json({ message: "Analytics API working", totalEmails });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

// ================= EMAILS PER DAY =================
router.get("/emails-per-day", async (req, res) => {
  try {
    const userEmail = req.headers["x-user-email"];
    if (!userEmail) {
      return res.status(400).json({ error: "Missing user email" });
    }

    const cacheKey = `analytics:${userEmail}:emails_per_day`;

    const cache = await redisClient.get(cacheKey);

    if (cache) {
      console.log("emails-per-day Cache HIT");

      res.json(JSON.parse(cache));

      // background refresh
      Email.aggregate([
        {
          $match: {
            date: { $exists: true },
            userEmail: userEmail
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone: "Asia/Kolkata"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
        .then((data) => {
          redisClient.setEx(cacheKey, 600, JSON.stringify(data));
          console.log("🔄 emails-per-day cache refreshed");
        })
        .catch(console.error);

      return;
    }

    console.log("emails-per-day Cache MISS");

    const data = await Email.aggregate([
      {
        $match: {
          date: { $exists: true },
          userEmail: userEmail
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "Asia/Kolkata"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    await redisClient.setEx(cacheKey, 600, JSON.stringify(data));

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching emails-per-day" });
  }
});

// ================= TOP SENDERS =================
router.get("/top-senders", async (req, res) => {
  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "Missing user email" });
  }

  const data = await getOrSetCache(
    `analytics:${userEmail}:top_senders`,
    async () => {
      return await Email.aggregate([
        {
          $match: {
            from: { $exists: true },
            userEmail: userEmail
          }
        },
        {
          $group: {
            _id: "$from",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }
  );

  res.json(data);
});

// ================= EMAILS BY HOUR =================
router.get("/emails-by-hour", async (req, res) => {
  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "Missing user email" });
  }

  const data = await getOrSetCache(
    `analytics:${userEmail}:emails_by_hour`,
    async () => {
      return await Email.aggregate([
        {
          $match: {
            date: { $exists: true },
            userEmail: userEmail
          }
        },
        {
          $group: {
            _id: { $hour: "$date" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }
  );

  res.json(data);
});

// ================= EMAILS BY WEEKDAY =================
router.get("/emails-by-weekday", async (req, res) => {
  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "Missing user email" });
  }

  const data = await getOrSetCache(
    `analytics:${userEmail}:emails_by_weekday`,
    async () => {
      return await Email.aggregate([
        {
          $match: {
            date: { $exists: true },
            userEmail: userEmail
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: "$date" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }
  );

  res.json(data);
});

// ================= SUMMARY =================
router.get("/summary", async (req, res) => {
  const userEmail = req.headers["x-user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "Missing user email" });
  }

  const data = await getOrSetCache(
    `analytics:${userEmail}:summary`,
    async () => {
      const [totalEmails, uniqueSenders, firstEmail, latestEmail] =
        await Promise.all([
          Email.countDocuments({ userEmail }),
          Email.distinct("from", { userEmail }),
          Email.findOne({ userEmail }).sort({ date: 1 }),
          Email.findOne({ userEmail }).sort({ date: -1 }),
        ]);

      return {
        totalEmails,
        uniqueSenders: uniqueSenders.length,
        firstEmailDate: firstEmail?.date,
        latestEmailDate: latestEmail?.date,
      };
    }
  );

  res.json(data);
});

module.exports = router;
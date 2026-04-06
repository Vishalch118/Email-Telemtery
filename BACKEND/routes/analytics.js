const express = require("express");
const router = express.Router();
const Email = require("../models/Email");
const redisClient=require("../redisClient");
const getOrSetCache = require("../utils/cache");


router.get("/", async (req, res) => {
  try {
    const totalEmails = await Email.countDocuments();
    res.json({ message: "Analytics API working", totalEmails });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

router.get("/emails-per-day", async (req, res) => {
  try {
    const cacheKey = "analytics:emails_per_day";

    const cache = await redisClient.get(cacheKey);

    if (cache) {
      console.log("emails-per-day Cache HIT");

      res.json(JSON.parse(cache));

      Email.aggregate([
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

router.get("/top-senders", async (req, res) => {
  const data = await getOrSetCache("analytics:top_senders", async () => {
    return await Email.aggregate([
      {
        $group: {
          _id: "$from",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
  });

  res.json(data);
});

router.get("/emails-by-hour", async (req, res) => {
  const data = await getOrSetCache("analytics:emails_by_hour", async () => {
    return await Email.aggregate([
      {
        $group: {
          _id: { $hour: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  });

  res.json(data);
});

router.get("/emails-by-weekday", async (req, res) => {
  const data = await getOrSetCache("analytics:emails_by_weekday", async () => {
    return await Email.aggregate([
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  });

  res.json(data);
});

router.get("/summary", async (req, res) => {
  const data = await getOrSetCache("analytics:summary", async () => {
    const totalEmails = await Email.countDocuments();
    const uniqueSenders = await Email.distinct("from");
    const firstEmail = await Email.findOne().sort({ date: 1 });
    const latestEmail = await Email.findOne().sort({ date: -1 });

    return {
      totalEmails,
      uniqueSenders: uniqueSenders.length,
      firstEmailDate: firstEmail?.date,
      latestEmailDate: latestEmail?.date
    };
  });

  res.json(data);
});

module.exports = router;
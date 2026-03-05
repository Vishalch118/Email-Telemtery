const express = require("express");
const router = express.Router();
const Email = require("../models/Email");

router.get("/emails-per-day", async (req, res) => {
  const data = await Email.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
});

router.get("/top-senders", async (req, res) => {
  const data = await Email.aggregate([
    {
      $group: {
        _id: "$from",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json(data);
});

router.get("/emails-by-hour", async (req, res) => {
  const data = await Email.aggregate([
    {
      $group: {
        _id: { $hour: "$date" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
});

router.get("/emails-by-weekday", async (req, res) => {
  const data = await Email.aggregate([
    {
      $group: {
        _id: { $dayOfWeek: "$date" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
});

router.get("/summary", async (req, res) => {
  try {

    const totalEmails = await Email.countDocuments();

    const uniqueSenders = await Email.distinct("from");

    const firstEmail = await Email.findOne().sort({ date: 1 });

    const latestEmail = await Email.findOne().sort({ date: -1 });

    res.json({
      totalEmails,
      uniqueSenders: uniqueSenders.length,
      firstEmailDate: firstEmail?.date,
      latestEmailDate: latestEmail?.date
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summary data" });
  }
});

module.exports = router;
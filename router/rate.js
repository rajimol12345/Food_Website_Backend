const express = require("express");
const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const router = express.Router();

/**
 * ===============================
 *   GET AVERAGE RATING
 *   /api/rating/average/:restaurantId
 * ===============================
 */
router.get("/average/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const avg = await Rating.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      average: avg[0]?.avgRating ?? 0,
      count: avg[0]?.count ?? 0,
    });
  } catch (err) {
    console.error("Average rating error:", err);
    res.status(500).json({ message: "Failed to get average rating" });
  }
});

/**
 * ===============================
 *   GET USER RATING
 *   /api/rating/:restaurantId/:userId
 * ===============================
 */
router.get("/:restaurantId/:userId", async (req, res) => {
  try {
    const { restaurantId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid restaurant or user ID" });
    }

    const rating = await Rating.findOne({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    res.json({
      rating: rating?.rating ?? 0,
      comment: rating?.comment ?? "",
    });
  } catch (err) {
    console.error("Get rating error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ===============================
 *   POST / UPDATE RATING (UPSERT)
 *   /api/rating
 * ===============================
 */
router.post("/", async (req, res) => {
  try {
    const { restaurantId, userId, rating, comment = "" } = req.body;

    if (!restaurantId || !userId || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid restaurant or user ID" });
    }

    const saved = await Rating.findOneAndUpdate(
      {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      {
        rating,
        comment,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Rating saved", data: saved });
  } catch (err) {
    console.error("Save rating error:", err);
    res.status(500).json({ message: "Failed to save rating" });
  }
});

module.exports = router;

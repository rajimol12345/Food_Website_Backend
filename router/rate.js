const express = require('express');
const Rating = require('../models/Rating');
const router = express.Router();

// GET current rating
router.get('/rate/:restaurantId', async (req, res) => {
  try {
    const r = await Rating.findOne({ restaurantId: req.params.restaurantId });
    res.json({ rating: r?.rating ?? 0 });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST / update rating
router.post('/rate', async (req, res) => {
  const { restaurantId, rating } = req.body;
  if (!restaurantId || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const updated = await Rating.findOneAndUpdate(
      { restaurantId },
      { rating },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to save rating' });
  }
});

module.exports = router;

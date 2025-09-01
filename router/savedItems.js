const express = require('express');
const router = express.Router();
const SavedItem = require('../models/SavedItem');
const Product = require('../models/Menu');

// POST: Add item to saved list
router.post('/add', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required' });
  }

  try {
    // Prevent duplicates
    const exists = await SavedItem.findOne({ userId, productId });
    if (exists) {
      return res.status(409).json({ message: 'Item already saved' });
    }

    const savedItem = new SavedItem({ userId, productId });
    await savedItem.save();
    res.status(201).json({ message: 'Item saved successfully', savedItem });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save item', error: err.message });
  }
});

// GET: Fetch all saved items for a user
router.get('/:userId', async (req, res) => {
  try {
    const items = await SavedItem.find({ userId: req.params.userId }).populate('productId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

// DELETE: Remove item from saved list
router.delete('/:userId/:productId', async (req, res) => {
  try {
    await SavedItem.deleteOne({
      userId: req.params.userId,
      productId: req.params.productId
    });
    res.json({ message: 'Item removed from saved list' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove saved item' });
  }
});

module.exports = router;

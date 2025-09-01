const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications (latest first)
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(updatedNotification);
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Clear all notifications
router.delete('/clear', async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

module.exports = router;

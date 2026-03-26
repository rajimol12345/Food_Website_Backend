const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get chat history for a specific user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error: error.message });
  }
});

// Get a list of users who have sent messages (for admin)
router.get("/conversations", async (req, res) => {
  try {
    const users = await Message.distinct("senderId", { role: "user" });
    // In a more complex app, we'd join with User model to get names
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
});

module.exports = router;

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

const User = require("../models/User");

// Get a list of users who have sent messages (for admin)
router.get("/conversations", async (req, res) => {
  try {
    const userIds = await Message.distinct("senderId", { role: "user" });
    
    // Fetch user details for these IDs
    // Note: We use $in to get all users at once
    const users = await User.find({ _id: { $in: userIds } }, "fullname profilePic");
    
    // Format the response to include both the ID and the details
    const conversations = userIds.map(id => {
      const userDetails = users.find(u => u._id.toString() === id);
      return {
        userId: id,
        fullname: userDetails ? userDetails.fullname : "Guest User",
        profilePic: userDetails ? userDetails.profilePic : null
      };
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();   // ✅ define router here
const Menu = require("../models/Menu");
const Fuse = require("fuse.js");

// Search route
router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: "Query parameter required" });

  try {
    const allMenus = await Menu.find();

    // Setup Fuse.js fuzzy search
    const fuse = new Fuse(allMenus, {
      keys: ["name", "description", "category"],
      threshold: 0.3, // smaller = stricter match
    });

    // Perform fuzzy search
    const results = fuse.search(query).map(r => r.item);

    res.json({ results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

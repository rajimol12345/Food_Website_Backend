const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const Fuse = require("fuse.js");

// ==============================
// SEARCH ROUTE (WORKING VERSION)
// ==============================
router.get("/", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json([]);
  }

  try {
    // Fetch all menu items
    const allMenus = await Menu.find();

    // Fuzzy Search Configuration
    const fuse = new Fuse(allMenus, {
      keys: ["name", "description", "category"],
      threshold: 0.3, // 0 exact match, 1 = very loose match
    });

    // Run Fuse search
    const results = fuse.search(query).map((r) => r.item);

    // Return as object to match frontend expectation
    res.json({ results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ results: [] });
  }
});

module.exports = router;

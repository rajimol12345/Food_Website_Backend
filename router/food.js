const express = require("express");
const Food = require("../models/Food");

const router = express.Router();

// Get all foods
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json({ success: true, count: foods.length, data: foods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search foods by name or category
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const foods = await Food.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });

    res.json({ success: true, count: foods.length, data: foods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new food
router.post("/", async (req, res) => {
  try {
    const food = new Food(req.body);
    const saved = await food.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get single food by id
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });
    res.json({ success: true, data: food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update food
router.put("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });
    res.json({ success: true, data: food });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete food
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });
    res.json({ success: true, message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

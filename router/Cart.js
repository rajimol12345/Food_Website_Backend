const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// =====================
// ADD TO CART
// =====================
router.post("/addcart", async (req, res) => {
  const { userId, menuId, quantity } = req.body;

  if (!userId || !menuId) {
    return res.status(400).json({ error: "userId and menuId are required" });
  }

  try {
    let existingItem = await Cart.findOne({ userId, menuId });

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();
    } else {
      const newItem = new Cart({
        userId,
        menuId,
        quantity: quantity || 1,
      });
      await newItem.save();
    }

    res.status(201).json({ message: "Item added to cart" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// =====================
// UPDATE QUANTITY
// =====================
router.put("/update/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity cannot be less than 1" });
    }

    const updated = await Cart.findByIdAndUpdate(
      itemId,
      { quantity },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================
// GET CART ITEMS WITH MENU DETAILS (INCLUDING IMAGE AND RESTAURANT)
// =====================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await Cart.find({ userId }).populate({
      path: "menuId",
      select: "name price image description restaurantId",
      populate: {
        path: "restaurantId",
        select: "name"
      }
    });

    res.json(cartItems);
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

// =====================
// DELETE CART ITEM
// =====================
router.delete("/:userId/:menuId", async (req, res) => {
  const { userId, menuId } = req.params;

  try {
    const deleted = await Cart.findOneAndDelete({ userId, menuId });

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item from cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

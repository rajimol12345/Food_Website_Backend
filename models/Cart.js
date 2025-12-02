const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  quantity: { type: Number, default: 1 }
});

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

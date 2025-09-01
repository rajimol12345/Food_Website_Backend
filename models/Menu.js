const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // base64 or URL
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// ✅ prevent OverwriteModelError when server restarts in dev
const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

module.exports = Menu; // ✅ CommonJS export

const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      required: true   // base64 or Cloudinary URL
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError in development
const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

module.exports = Menu;

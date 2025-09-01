const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String, // store image URL or base64 string
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);

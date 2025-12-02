const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId, // better than string
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { timestamps: true }
);


ratingSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);

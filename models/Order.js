const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Human friendly Order ID -> "ORD-123456"
  orderId: {
    type: String,
    required: true,
    unique: true,
  },

  // User who placed the order
  userId: { 
    type: String, 
    required: true 
  },

  // Restaurant Name (displayed on success page)
  restaurantName: {
    type: String,
    required: true,
  },

  // Items inside the order
  items: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
      image: { type: String },   // image URL or base64
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],

  // Total price (Frontend uses order.total)
  total: { 
    type: Number, 
    required: true 
  },

  // Delivery Address
  address: {
    name: { type: String },   // Optional (since frontend doesn't send)
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  // Delivery Time (Frontend uses order.deliveryTime)
  deliveryTime: {
    type: String,
    default: "30–40 mins",
  },

  // Current status of the order
  status: {
    type: String,
    enum: ["Pending", "Preparing", "On the way", "Delivered", "Cancelled"],
    default: "Pending",
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

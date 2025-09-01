const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
      },
      image: String,   // URL or base64 of the food image
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
  totalAmount: { type: Number, required: true },
  address: {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['Pending', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

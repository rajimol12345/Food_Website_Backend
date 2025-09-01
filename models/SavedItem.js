const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Menu'  // This refers to your menu items
  }
}, { timestamps: true });

module.exports = mongoose.model('SavedItem', savedItemSchema);

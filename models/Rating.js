const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rating', ratingSchema);

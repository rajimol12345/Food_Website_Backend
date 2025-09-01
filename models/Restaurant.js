const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  openingHours: {
    type: String,
    required: true
  },
  image: {
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);

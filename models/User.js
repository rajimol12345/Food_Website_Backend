const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: String,
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    pincode: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  status: { type: String, default: 'Active' },
  profilePic: String,
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    pincode: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
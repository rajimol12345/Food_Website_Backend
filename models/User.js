const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  phone: String,
  password: String,
  profilePic: String,
  deliveryAddress: {
    line1: String,
    line2: String,
    city: String,
    pincode: String,
  },
});

module.exports = mongoose.model('User', userSchema);

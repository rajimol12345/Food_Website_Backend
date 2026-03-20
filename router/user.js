const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); 

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');

// ========== REGISTER ==========
router.post('/register', async (req, res) => {
  // Check DB connection
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ DB Connection Error: readyState =', mongoose.connection.readyState);
    return res.status(500).json({ error: 'Internal Server Error: Database not connected' });
  }

  const { fullname, email, phone, password, confirmPassword } = req.body;
                            
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, email, phone, password: hashedPassword });
    await newUser.save();

    console.log(`✅ User registered successfully: ${email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error: ' + err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  // Check DB connection
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ DB Connection Error: readyState =', mongoose.connection.readyState);
    return res.status(500).json({ error: 'Internal Server Error: Database not connected' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', token: user.id }); // You can replace with JWT later
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ========== USER PROFILE ==========
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile/:id', async (req, res) => {
  const updates = req.body;

  const allowedFields = ['fullname', 'email', 'phone', 'profilePic', 'deliveryAddress'];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
//====== List All Users ======//
router.get('/userslist', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users list:', error);
      res.status(500).json({ error: 'Failed to fetch users list' });
      }
      });
//=======Delete User===========
// DELETE a user by ID
router.delete('/deleteProfile/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ========== ADD RESTAURANT ==========
router.post('/restaurants', async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      cuisine,
      email,
      openingHours,
      rating,
      image
    } = req.body;

    if (!name || !address || !phone || !cuisine || !email || !openingHours || !rating) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const newRestaurant = new Restaurant({
      name,
      address,
      phone,
      cuisine,
      email,
      openingHours,
      rating,
      image
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (err) {
    console.error('Error saving restaurant:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
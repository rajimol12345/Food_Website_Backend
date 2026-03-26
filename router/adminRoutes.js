const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Register Admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for missing fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    return res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});
// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Login successful
    res.status(200).json({ message: 'Login successful' });

    // Optionally return JWT token here
    // const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    // res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;

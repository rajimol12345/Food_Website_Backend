const express = require('express');
const bcrypt = require('bcryptjs');
const Settings = require('../models/Settings');
const router = express.Router();

// GET profile
router.get('/profile', async (req, res) => {
  try {
    const settings = await Settings.findOne().select('-passwordHash');
    if (!settings) {
      // Return empty values instead of 404
      return res.json({ name: "", email: "" });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST update/create settings
router.post('/settings', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      if (!password || password.trim() === "") {
        return res.status(400).json({ message: 'Password required to create settings' });
      }
      const hash = await bcrypt.hash(password, 10);
      settings = new Settings({ name, email, passwordHash: hash });
    } else {
      settings.name = name;
      settings.email = email;
      if (password && password.trim() !== '') {
        settings.passwordHash = await bcrypt.hash(password, 10);
      }
    }

    await settings.save();
    res.json({ message: 'Settings saved successfully', settings: { name: settings.name, email: settings.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

module.exports = router;

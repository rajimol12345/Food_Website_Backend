const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');
//  Add Restaurant (base64 image or URL)
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
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newRestaurant = new Restaurant({
      name,
      address,
      phone,
      cuisine,
      email,
      openingHours,
      rating,
      image // stored directly as string
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (err) {
    console.error('Error adding restaurant:', err);
    res.status(500).json({ message: 'Server error while adding restaurant' });
  }
});

//  Get All Restaurants
router.get('/list', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get Single Restaurant by ID
router.get('/list/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurant' });
  }
});

//  Delete Restaurant
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting restaurant' });
  }
});

router.put('/edit/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  try {
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ message: 'Error updating restaurant' });
  }
});
module.exports = router;

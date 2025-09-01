const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const mongoose = require('mongoose');

// Add new menu
router.post('/addmenu', async (req, res) => {
  try {
    const { name, price, description, image, restaurantId } = req.body;

    const newMenu = new Menu({ name, price, description, image, restaurantId });
    const savedMenu = await newMenu.save();

    res.status(201).json(savedMenu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add menu' });
  }
});

// Get a single menu item by ID
router.get('/item/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid menu ID format' });
  }

  try {
    const menuItem = await Menu.findById(id);
    if (!menuItem) return res.status(404).json({ error: 'Menu item not found' });

    res.status(200).json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//  Get all menus with restaurant name populated (for admin)
router.get('/admin/menus', async (req, res) => {
  try {
    const menus = await Menu.find().populate('restaurantId', 'name');
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// ✅ Update menu by ID (admin)
router.put('/admin/menus/:id', async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Menu not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

// ✅ Delete menu by ID (admin)
router.delete('/admin/menus/:id', async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ error: 'Menu not found' });

    res.status(200).json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
});

// ✅ Get all menus for a specific restaurant (moved to bottom to avoid route conflict)
router.get('/restaurant/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ message: 'Invalid restaurantId format' });
  }

  try {
    const menus = await Menu.find({ restaurantId });
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Search menus by name (case-insensitive)
router.get('/menus/search/:menuName', async (req, res) => {
  try {
    const menuName = req.params.menuName;
    const menus = await Menu.find({
      name: { $regex: menuName, $options: 'i' }
    });
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error searching menus by name:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search menus by category (case-insensitive)
router.get('/menus/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    const menus = await Menu.find({
      category: { $regex: categoryName, $options: 'i' }
    });
    res.status(200).json(menus);
  } catch (error) {
    console.error('Error searching menus by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;

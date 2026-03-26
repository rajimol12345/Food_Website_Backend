const mongoose = require('mongoose');
const Menu = require('./models/Menu');

async function updateCategories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/food_ordering');
    console.log('Connected to MongoDB');

    const updates = [
      { pattern: /Biryani/i, category: 'Biryani' },
      { pattern: /Pizza/i, category: 'Pizzas' },
      { pattern: /Burger/i, category: 'Burgers' },
      { pattern: /Noodle/i, category: 'Noodles' },
      { pattern: /Paratha/i, category: 'Paratha' },
      { pattern: /Shake/i, category: 'Shake' },
      { pattern: /Samosa/i, category: 'Samosa' },
      { pattern: /Sandwich/i, category: 'Sandwich' },
      { pattern: /Ice Cream/i, category: 'Ice Cream' },
      { pattern: /Pasta/i, category: 'Pasta' },
      { pattern: /Soup/i, category: 'Soup' },
      { pattern: /Salad/i, category: 'Salad' },
      { pattern: /Fries/i, category: 'Fries' },
      { pattern: /Dosa/i, category: 'Dosa' },
      { pattern: /Idli/i, category: 'Idli' },
      { pattern: /Chaat/i, category: 'Chaat' },
      { pattern: /Roll/i, category: 'Rolls' },
      { pattern: /Tandoori/i, category: 'Tandoori' },
      { pattern: /Thali/i, category: 'Thali' },
      { pattern: /Chinese/i, category: 'Chinese' }
    ];

    for (const item of updates) {
      const res = await Menu.updateMany(
        { name: { $regex: item.pattern } },
        { $set: { category: item.category } }
      );
      if (res.modifiedCount > 0) {
        console.log(`Updated ${res.modifiedCount} items to category: ${item.category}`);
      }
    }

    console.log('Category update complete');
    process.exit(0);
  } catch (err) {
    console.error('Error updating categories:', err);
    process.exit(1);
  }
}

updateCategories();

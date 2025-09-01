// routes/admin.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Helper to get order trends grouped by day of week
function getWeekdayName(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    // Total orders count
    const totalOrders = await Order.countDocuments();

    // Total revenue sum of all orders
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Active users count (example: users with status active)
    const activeUsers = await User.countDocuments({ status: 'Active' });

    // New restaurants added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newRestaurants = await Restaurant.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Weekly order trends (orders count grouped by weekday)
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 6); // last 7 days including today

    const ordersLastWeek = await Order.find({
      createdAt: { $gte: weekAgoDate }
    });

    // Group orders by day
    const orderTrendsMap = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      orderTrendsMap[getWeekdayName(date)] = 0;
    }

    ordersLastWeek.forEach(order => {
      const day = getWeekdayName(order.createdAt);
      orderTrendsMap[day] = (orderTrendsMap[day] || 0) + 1;
    });

    // Convert to array in order Sun -> Sat (or Mon->Sun, adjust as needed)
    const orderTrends = Object.entries(orderTrendsMap)
      .map(([name, orders]) => ({ name, orders }))
      .reverse();

    // Recent orders (latest 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id items totalAmount status createdAt');

    // Format recent orders list for frontend display
    const recentOrdersFormatted = recentOrders.map(order => {
      const firstItem = order.items[0];
      const itemSummary = firstItem ? `${firstItem.quantity}x ${firstItem.name}` : 'No items';
      return {
        id: order._id,
        summary: `${itemSummary}, ₹${order.totalAmount}`,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    res.json({
      totalOrders,
      totalRevenue,
      activeUsers,
      newRestaurants,
      orderTrends,
      recentOrders: recentOrdersFormatted,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error fetching admin stats' });
  }
});
router.get('/overview', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const restaurantsCount = await Restaurant.countDocuments();
    const orders = await Order.find();
    const ordersCount = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      stats: {
        users: usersCount,
        restaurants: restaurantsCount,
        orders: ordersCount,
        revenue,
      },
      activities: [
        'User Ramesh placed an order worth ₹1,200',
        'New restaurant "Spice Club" registered',
        'User Priya wrote a review for "Curry Point"',
        '5 new users signed up',
      ],
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Notification = require("../models/Notification");

// ✅ Environment Variables
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;  
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

// ✅ Utility: Generate PayPal Access Token
async function generateAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: "client_credentials" }),
      { headers: { Authorization: `Basic ${auth}` } }
    );
    return response.data.access_token;
  } catch (err) {
    console.error("PayPal Auth Error:", err.response?.data || err.message);
    throw new Error("Failed to generate PayPal access token");
  }
}

// ✅ PayPal: Create Order
router.post("/create-paypal-order", async (req, res) => {
  try {
    const { totalAmount } = req.body;
    if (!totalAmount) return res.status(400).json({ error: "Total amount is required" });

    const accessToken = await generateAccessToken();
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: totalAmount.toString() } }],
      },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error creating PayPal order:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// ✅ PayPal: Capture Order
router.post("/capture-paypal-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await generateAccessToken();
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.error("Error capturing PayPal order:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
});

// ✅ Place Order
router.post("/place", async (req, res) => {
  const { userId, address } = req.body;
  if (!userId || !address?.line1 || !address?.city || !address?.pincode) {
    return res.status(400).json({ error: "Incomplete delivery address or missing user ID" });
  }

  try {
    const cartItems = await Cart.find({ userId }).populate("menuId");
    if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

    const orderItems = cartItems.map(item => ({
      menuId: item.menuId._id,
      name: item.menuId.name,
      price: item.menuId.price,
      quantity: item.quantity || 1,
    }));

    const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId,
      items: orderItems,
      totalAmount,
      address,
      status: "Pending",
      createdAt: new Date(),
    });

    await newOrder.save();
    await Cart.deleteMany({ userId });

    await Notification.create({
      message: `New order from user ${userId} — ₹${totalAmount}`,
      isRead: false,
    });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Server error while placing order" });
  }
});

// ✅ Get User Orders
router.get("/myorders", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Get All Orders
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Get Single Order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json({ order });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// In your PUT route
router.put("/:id", async (req, res) => {
  const { id } = req.params;  
  const { status, address } = req.body;

  // 🔒 Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid order ID" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (status) order.status = status;
    if (address) order.address = { ...order.address, ...address };
    await order.save();

    await Notification.create({
      message: `Order ${order._id} updated`,
      isRead: false,
    });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;

import express from "express";
import axios from "axios";

const router = express.Router();

// Get PayPal Client ID (for frontend)
router.get("/client-id", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Create PayPal Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const response = await axios({
      url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
        ).toString("base64")}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "PayPal order creation failed", error: error.message });
  }
});

// Capture PayPal Order
router.post("/capture-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios({
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
        ).toString("base64")}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "PayPal order capture failed", error: error.message });
  }
});

export default router;

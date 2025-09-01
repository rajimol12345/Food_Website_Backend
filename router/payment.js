// router/payment.js
const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const Order = require('../models/Order'); //  import Order model
const router = express.Router();

//  PayPal Sandbox Environment
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

//  Create PayPal Order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount.toString(), //  Amount from frontend
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("PayPal Create Order Error:", err);
    res.status(500).json({ error: "Something went wrong while creating the order" });
  }
});

//  Capture PayPal Order + Save to DB
router.post('/capture-order/:paypalOrderId', async (req, res) => {
  const { paypalOrderId } = req.params;
  const { localOrderId } = req.body; //  MongoDB orderId comes from frontend

  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);

    //  Extract PayPal transaction ID
    const transactionId =
      capture.result?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    //  Update MongoDB order with PayPal details
    const updatedOrder = await Order.findByIdAndUpdate(
      localOrderId,
      {
        paymentMode: "PayPal",
        paymentId: transactionId,
        status: "Paid",
      },
      { new: true }
    ).populate("userId", "name email");

    res.json({
      success: true,
      message: "Payment captured and order updated successfully",
      transactionId,
      updatedOrder,
      paypalDetails: capture.result,
    });
  } catch (err) {
    console.error("PayPal Capture Error:", err);
    res.status(500).json({ error: "Payment capture failed" });
  }
});

module.exports = router;

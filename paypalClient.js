// paypalClient.js
const paypal = require('@paypal/checkout-server-sdk');

const clientId = process.env.PAYPAL_CLIENT_ID;     // from .env
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;

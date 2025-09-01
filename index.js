require('dotenv').config(); //  Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- CORS + Socket.IO ----
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(' Client connected:', socket.id);
  socket.on('disconnect', () => console.log(' Client disconnected:', socket.id));
});

// ---- Middleware ----
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- MongoDB ----
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food_ordering')
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// ---- Routers ----
const UserRouter = require('./router/user');
const RestaurantRouter = require('./router/restaurants');
const MenuRouter = require('./router/menu');
const CartRouter = require('./router/Cart');
const SavedItemRoutes = require('./router/savedItems');
const OrderRouter = require('./router/order');
const SearchRouter = require('./router/search');
const AdminRouter = require('./router/admin');
const adminNotificationRouter = require('./router/adminNotifications');
const settingsRouter = require('./router/settings');
const rateRouter = require('./router/rate');
const adminRoutes = require('./router/adminRoutes');
const paymentRouter = require('./router/payment'); // PayPal routes
const foodRoutes = require("./router/food");
// ---- API Routes ----
app.use('/food-ordering-app/api/user', UserRouter);
app.use('/api/restaurants', RestaurantRouter);
app.use('/api/menu', MenuRouter);
app.use('/api/cart', CartRouter);
app.use('/api/saved', SavedItemRoutes);
app.use('/api/order', OrderRouter);
app.use('/api/search', SearchRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/admin/notifications', adminNotificationRouter);
app.use('/api', settingsRouter);
app.use('/api/rate', rateRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRouter); // /api/payment/create-order, /api/payment/capture-order
app.use("/api/foods", foodRoutes);

// PayPal Client ID endpoint
app.get('/api/payment/config', (req, res) => {
  const cid = process.env.PAYPAL_CLIENT_ID || '';
  if (!cid) {
    console.warn(' PAYPAL_CLIENT_ID is missing in your .env');
  }
  res.json({ clientId: cid });
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- Start Server with Auto Port Fallback ----
function startServer(port) {
  server.listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(` Port ${port} in use. Retrying on ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error(' Server error:', err);
      }
    })
    .on('listening', () => {
      const masked =
        (process.env.PAYPAL_CLIENT_ID || '').slice(0, 6) +
        '...' +
        (process.env.PAYPAL_CLIENT_ID || '').slice(-4);
      console.log(` Server running at http://localhost:${server.address().port}`);
      console.log(` PayPal Client ID loaded: ${process.env.PAYPAL_CLIENT_ID ? masked : 'MISSING'}`);
    });
}

startServer(Number(PORT));

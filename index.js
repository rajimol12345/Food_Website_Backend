require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

// Import Models
const Message = require("./models/Message");

// Import Routers
const UserRouter = require("./router/user");
const RestaurantRouter = require("./router/restaurants");
const MenuRouter = require("./router/menu");
const CartRouter = require("./router/Cart");
const SavedItemRoutes = require("./router/savedItems");
const OrderRouter = require("./router/order");
const SearchRouter = require("./router/search");
const AdminRouter = require("./router/admin");
const adminNotificationRouter = require("./router/adminNotifications");
const settingsRouter = require("./router/settings");
const ratingRouter = require("./router/rate");
const adminRoutes = require("./router/adminRoutes");
const paymentRouter = require("./router/payment");
const foodRoutes = require("./router/food");
const messageRouter = require("./router/message");

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------------
// HTTP SERVER + SOCKET.IO SETUP
// -----------------------------------------------------------------------------
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a private support room (for users)
  socket.on("join_chat", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their support chat room`);
  });

  // Join the global admin room
  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log("Admin joined the global support room");
  });

  // Handle messages from user or admin
  socket.on("send_message", async (data) => {
    // data: { senderId, receiverId, message, role }
    const { receiverId, message, role, senderId } = data;
    
    try {
      // Create and save new message to DB
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        role,
        timestamp: new Date()
      });
      await newMessage.save();

      // 1. Send to the designated recipient's room
      io.to(receiverId).emit("receive_message", {
        senderId,
        message,
        role,
        timestamp: newMessage.timestamp
      });

      // 2. If it's from a user, also broadcast it to the global admin room 
      // for discovery (so admins see new users appearing in the list)
      if (role === 'user') {
        io.to("admin_room").emit("new_admin_message", {
          senderId,
          message,
          role,
          timestamp: newMessage.timestamp
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin that is not undefined (useful for mobile apps or local testing)
      if (!origin) return callback(null, true);
      callback(null, true); // Reflect any origin to browser
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -----------------------------------------------------------------------------
// REQUEST LOGGER
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body present: ${!!req.body}`);
  }
  next();
});

// -----------------------------------------------------------------------------
// HEALTH CHECK
// -----------------------------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState,
    message: "Backend diagnostics active. Version 1.1"
  });
});

// -----------------------------------------------------------------------------
// MONGO DB CONNECTION
// -----------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/food_ordering", {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Full error details:", err);
  });

// -----------------------------------------------------------------------------
// API ENDPOINTS
// -----------------------------------------------------------------------------
app.use("/food-ordering-app/api/user", UserRouter);
app.use("/api/restaurants", RestaurantRouter);
app.use("/api/menu", MenuRouter);
app.use("/api/cart", CartRouter);
app.use("/api/saved", SavedItemRoutes);
app.use("/api/order", OrderRouter);
app.use("/api/search", SearchRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/admin/notifications", adminNotificationRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/rate", ratingRouter); // ⭐ Correct rating API path: /api/rate
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRouter);
app.use("/api/foods", foodRoutes);
app.use("/api/messages", messageRouter);

// -----------------------------------------------------------------------------
// PAYPAL PUBLIC CLIENT ID ENDPOINT
// -----------------------------------------------------------------------------
app.get("/api/payment/config", (req, res) => {
  const cid = process.env.PAYPAL_CLIENT_ID || "";
  if (!cid) console.warn("⚠ PAYPAL_CLIENT_ID missing in .env");
  res.json({ clientId: cid });
});

// -----------------------------------------------------------------------------
// 404 HANDLER
// -----------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -----------------------------------------------------------------------------
// GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// -----------------------------------------------------------------------------
// START SERVER WITH AUTO PORT FALLBACK
// -----------------------------------------------------------------------------
const startServer = (port) => {
  const currentPort = Number(port);

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠ Port ${currentPort} already in use. Trying ${currentPort + 1}...`);
      server.close(() => {
        startServer(currentPort + 1);
      });
    } else {
      console.error("❌ Server Error:", err);
      process.exit(1);
    }
  });

  server.once("listening", () => {
    const addr = server.address();
    const actualPort = typeof addr === "string" ? addr : addr.port;
    
    const maskedCID =
      (process.env.PAYPAL_CLIENT_ID || "").slice(0, 6) +
      "..." +
      (process.env.PAYPAL_CLIENT_ID || "").slice(-4);

    console.log(`🚀 Server running on http://localhost:${actualPort}`);
    console.log(
      `PayPal Client ID: ${
        process.env.PAYPAL_CLIENT_ID ? maskedCID : "⚠ NOT SET"
      }`
    );
  });

  server.listen(currentPort);
};

startServer(PORT);
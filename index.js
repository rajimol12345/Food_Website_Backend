require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

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

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -----------------------------------------------------------------------------
// MONGO DB CONNECTION
// -----------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/food_ordering")
  .then(() => console.log("MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// -----------------------------------------------------------------------------
// ROUTERS (Make sure these files exist inside /router folder)
// -----------------------------------------------------------------------------
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
const ratingRouter = require("./router/rate"); // ⭐ Your rating route
const adminRoutes = require("./router/adminRoutes");
const paymentRouter = require("./router/payment");
const foodRoutes = require("./router/food");

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
// START SERVER WITH AUTO PORT FALLBACK
// -----------------------------------------------------------------------------
function startServer(port) {
  server
    .listen(port)
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`⚠ Port ${port} already in use. Trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("Server Error:", err);
      }
    })
    .on("listening", () => {
      const maskedCID =
        (process.env.PAYPAL_CLIENT_ID || "").slice(0, 6) +
        "..." +
        (process.env.PAYPAL_CLIENT_ID || "").slice(-4);

      console.log(`🚀 Server running on http://localhost:${server.address().port}`);
      console.log(
        `PayPal Client ID: ${
          process.env.PAYPAL_CLIENT_ID ? maskedCID : "⚠ NOT SET"
        }`
      );
    });
}

startServer(Number(PORT));

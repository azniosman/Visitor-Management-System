const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, createIndexes } = require("./utils/database");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Import routes
const visitorRoutes = require("./routes/visitorRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const keyRoutes = require("./routes/keyRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes); // Auth routes don't require authentication
app.use("/api/visitors", visitorRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/keys", keyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/health", healthRoutes); // Health check route

// Simple health check for load balancers
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// API documentation route
app.get("/api/docs", (req, res) => {
  res.status(200).json({
    message: "API documentation",
    endpoints: {
      auth: [
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Login with email and password",
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "Logout (requires authentication)",
        },
        {
          method: "POST",
          path: "/api/auth/register",
          description: "Register a new user",
        },
        {
          method: "POST",
          path: "/api/auth/forgot-password",
          description: "Request password reset",
        },
        {
          method: "POST",
          path: "/api/auth/reset-password",
          description: "Reset password with token",
        },
      ],
      visitors: [
        {
          method: "GET",
          path: "/api/visitors",
          description: "Get all visitors",
        },
        {
          method: "GET",
          path: "/api/visitors/:id",
          description: "Get visitor by ID",
        },
        {
          method: "POST",
          path: "/api/visitors",
          description: "Create new visitor",
        },
        {
          method: "PUT",
          path: "/api/visitors/:id",
          description: "Update visitor",
        },
        {
          method: "DELETE",
          path: "/api/visitors/:id",
          description: "Delete visitor",
        },
        {
          method: "POST",
          path: "/api/visitors/:id/check-in",
          description: "Check in visitor",
        },
        {
          method: "POST",
          path: "/api/visitors/:id/check-out",
          description: "Check out visitor",
        },
      ],
      shipments: [
        {
          method: "GET",
          path: "/api/shipments",
          description: "Get all shipments",
        },
        {
          method: "GET",
          path: "/api/shipments/:id",
          description: "Get shipment by ID",
        },
        {
          method: "POST",
          path: "/api/shipments",
          description: "Create new shipment",
        },
        {
          method: "PUT",
          path: "/api/shipments/:id",
          description: "Update shipment",
        },
        {
          method: "DELETE",
          path: "/api/shipments/:id",
          description: "Delete shipment",
        },
        {
          method: "POST",
          path: "/api/shipments/:id/in-transit",
          description: "Mark shipment as in-transit",
        },
        {
          method: "POST",
          path: "/api/shipments/:id/delivered",
          description: "Mark shipment as delivered",
        },
      ],
      keys: [
        { method: "GET", path: "/api/keys", description: "Get all keys" },
        { method: "GET", path: "/api/keys/:id", description: "Get key by ID" },
        { method: "POST", path: "/api/keys", description: "Create new key" },
        { method: "PUT", path: "/api/keys/:id", description: "Update key" },
        { method: "DELETE", path: "/api/keys/:id", description: "Delete key" },
        {
          method: "POST",
          path: "/api/keys/:id/checkout",
          description: "Checkout key",
        },
        {
          method: "POST",
          path: "/api/keys/:id/return",
          description: "Return key",
        },
      ],
      users: [
        {
          method: "GET",
          path: "/api/users",
          description: "Get all users (admin only)",
        },
        {
          method: "GET",
          path: "/api/users/:id",
          description: "Get user by ID",
        },
        {
          method: "POST",
          path: "/api/users",
          description: "Create new user (admin only)",
        },
        { method: "PUT", path: "/api/users/:id", description: "Update user" },
        {
          method: "DELETE",
          path: "/api/users/:id",
          description: "Delete user (admin only)",
        },
        {
          method: "GET",
          path: "/api/users/me/profile",
          description: "Get current user profile",
        },
        {
          method: "PUT",
          path: "/api/users/me/profile",
          description: "Update current user profile",
        },
      ],
    },
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create database indexes
    await createIndexes();

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API documentation: http://localhost:${port}/api/docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

// Start the server
startServer();

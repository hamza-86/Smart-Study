const express = require("express");
require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const dbConnect = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const logger = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewRoutes = require("./routes/review.routes");
const categoryRoutes = require("./routes/category.routes");
const progressRoutes = require("./routes/progress.routes");
const instructorRoutes = require("./routes/instructor.routes");
const studentRoutes = require("./routes/student.routes");
const couponRoutes = require("./routes/coupon.routes");

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ── File upload ───────────────────────────────────────────────────────────────
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: process.env.TEMP_DIR || "/tmp",
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB (videos)
    abortOnLimit: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────

// Global: 200 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Auth endpoints: 10 req / 15 min (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/sendotp", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);

// ── Request logger ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// ── Connect DB & Cloudinary ───────────────────────────────────────────────────
dbConnect();
cloudinaryConnect();

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EduFlow API is running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "healthy", timestamp: new Date() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/coupons", couponRoutes);

// ── 404 handler (must be after all routes) ────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Server startup ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    url: `http://localhost:${PORT}`,
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    const mongoose = require("mongoose");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force exit after 10 s if something hangs
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ── Process-level error guards ────────────────────────────────────────────────
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception — shutting down", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection — shutting down", new Error(String(reason)));
  process.exit(1);
});

module.exports = app; // for testing
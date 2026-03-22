const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const dbConnect = require("./config/dataBase");
const { cloudinaryConnect } = require("./config/cloudinary");
const logger = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");
const { requireDbConnection } = require("./middlewares/dbReady");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewRoutes = require("./routes/review.routes");
const categoryRoutes = require("./routes/category.routes");
const progressRoutes = require("./routes/progress.routes");
const instructorRoutes = require("./routes/instructor.routes");
const studentRoutes = require("./routes/student.routes");
const couponRoutes = require("./routes/coupon.routes");
const sectionRoutes = require("./routes/section.routes");
const subsectionRoutes = require("./routes/subsection.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: process.env.TEMP_DIR || "/tmp",
    limits: { fileSize: 500 * 1024 * 1024 },
    abortOnLimit: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

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
app.use("/api/v1/auth/reset-password", authLimiter);

if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SmartStudy API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Service healthy",
    data: { dbState: mongoose.connection.readyState },
    error: null,
  });
});

app.use("/api/v1", requireDbConnection);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/instructor", instructorRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/subsections", subsectionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
let server;

const startServer = async () => {
  await dbConnect();
  cloudinaryConnect();

  server = app.listen(PORT, () => {
    logger.info("Server started", {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      url: `http://localhost:${PORT}`,
    });
  });
};

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully.`);

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    logger.info("HTTP server closed");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception. Shutting down.", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection. Shutting down.", new Error(String(reason)));
  process.exit(1);
});

startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});

module.exports = app;

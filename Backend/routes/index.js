/**
 * Routes Index
 * FILE LOCATION: Backend/routes/index.js
 *
 * This file sits INSIDE the routes/ folder alongside all your other route files.
 * It imports every route file and combines them into one router.
 *
 * Your index.js at the root then does:
 *   const routes = require("./routes");   <-- loads this file
 *   app.use("/api/v1", routes);
 */

const express = require("express");
const router  = express.Router();

const authRoutes       = require("./auth.routes");
const courseRoutes     = require("./course.routes");
const paymentRoutes    = require("./payment.routes");
const reviewRoutes     = require("./review.routes");
const categoryRoutes   = require("./category.routes");
const progressRoutes   = require("./progress.routes");
const instructorRoutes = require("./instructor.routes");
const studentRoutes    = require("./student.routes");
const couponRoutes     = require("./coupon.routes");

router.use("/auth",        authRoutes);
router.use("/courses",     courseRoutes);
router.use("/payments",    paymentRoutes);
router.use("/reviews",     reviewRoutes);
router.use("/categories",  categoryRoutes);
router.use("/progress",    progressRoutes);
router.use("/instructor",  instructorRoutes);
router.use("/student",     studentRoutes);
router.use("/coupons",     couponRoutes);

module.exports = router;
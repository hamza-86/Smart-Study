const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const logger = require("../utils/logger");

const DEFAULT_RETRIES = Number(process.env.DB_CONNECT_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 4000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const dbConnect = async (retries = DEFAULT_RETRIES) => {
  const mongoUri =
  process.env.MONGODB_URL ||
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI is missing. Set MONGODB_URL (or MONGODB_URI / MONGO_URI) in .env"
    );
  }

  mongoose.set("bufferCommands", false);

  let attempt = 0;
  while (attempt < retries) {
    attempt += 1;
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 20,
        minPoolSize: 2,
      });

      logger.info("MongoDB connected successfully", { attempt });
      return mongoose.connection;
    } catch (error) {
      logger.error("MongoDB connection attempt failed", error, {
        attempt,
        retries,
      });

      if (attempt >= retries) {
        throw error;
      }

      await wait(RETRY_DELAY_MS);
    }
  }
};

module.exports = dbConnect;

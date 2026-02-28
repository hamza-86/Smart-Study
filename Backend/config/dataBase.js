const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const logger = require("../utils/logger");

exports.cloudinaryConnect = () => {
  const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_NAME;
  const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn("Cloudinary config missing. File uploads will be unavailable.");
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    logger.info("Cloudinary connected successfully");
    return true;
  } catch (error) {
    logger.error("Cloudinary connection failed", error);
    return false;
  }
};

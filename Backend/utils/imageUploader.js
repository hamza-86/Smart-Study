/**
 * Cloudinary File Upload Utility
 * Handles images, videos, and documents
 */

const cloudinary = require("cloudinary").v2;
const APIError = require("./apiError");

/**
 * Upload a file to Cloudinary
 *
 * @param {object} file       - express-fileupload file object (needs tempFilePath)
 * @param {string} folder     - Cloudinary folder path
 * @param {number} [width]    - resize width (images only)
 * @param {number} [height]   - resize height (images only)
 * @param {number} [quality]  - compression quality 1-100
 * @returns {object}          - Cloudinary upload result
 */
exports.uploadImageToCloudinary = async (file, folder, width, height, quality) => {
  if (!file || !file.tempFilePath) {
    throw APIError.fileUpload("Invalid file — tempFilePath missing");
  }

  if (!folder) {
    throw APIError.fileUpload("Cloudinary folder is required");
  }

  try {
    const options = {
      folder,
      resource_type:   "auto",   // handles image, video, raw (pdf/doc)
      use_filename:    true,
      unique_filename: true,
      overwrite:       false,
    };

    // Image transformations
    if (width  != null) options.width  = width;
    if (height != null) options.height = height;
    if (quality != null) options.quality = quality;

    // Use chunk upload for large videos (> 20 MB)
    const isVideo = file.mimetype?.startsWith("video/");
    if (isVideo) {
      options.chunk_size     = 6_000_000; // 6 MB chunks
      options.eager_async    = true;
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result;

  } catch (error) {
    // Rethrow as APIError so error handler formats it correctly
    if (error.isAPIError) throw error;
    throw APIError.fileUpload(
      `Upload to Cloudinary failed: ${error.message}`,
      { cloudinaryError: error.http_code || null }
    );
  }
};

/**
 * Delete a file from Cloudinary by public_id
 *
 * @param {string} publicId      - Cloudinary public_id
 * @param {"image"|"video"|"raw"} [resourceType="image"]
 * @returns {object}             - Cloudinary destroy result
 */
exports.deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    // Non-fatal — log but don't throw (file may already be gone)
    const logger = require("./logger");
    logger.warn("Cloudinary delete failed", { publicId, error: error.message });
    return null;
  }
};
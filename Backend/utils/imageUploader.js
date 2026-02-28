const cloudinary = require("cloudinary").v2;

/*
  Upload file to Cloudinary
  Supports images & videos
*/
exports.uploadImageToCloudinary = async (
  file,
  folder,
  height,
  quality
) => {
  try {
    if (!file || !file.tempFilePath) {
      throw new Error("Invalid file upload");
    }

    if (!folder) {
      throw new Error("Cloudinary folder not specified");
    }

    const options = {
      folder,
      resource_type: "auto", // supports image & video
      use_filename: true,
      unique_filename: true,
    };

    if (height) options.height = height;
    if (quality) options.quality = quality;

    const result = await cloudinary.uploader.upload(
      file.tempFilePath,
      options
    );

    return result;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    throw new Error("File upload failed");
  }
};
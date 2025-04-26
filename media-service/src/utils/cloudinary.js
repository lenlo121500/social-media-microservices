import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
} from "../config/env.js";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "media-service",
      },
      (error, result) => {
        if (error) {
          logger.error("Error uploading file to Cloudinary: ", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info("File deleted from Cloudinary successfully", publicId);
    return result;
  } catch (error) {
    logger.error("Error deleting file from Cloudinary: ", error);
    throw error;
  }
};

import Media from "../model/media.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const uploadMedia = async (req, res) => {
  logger.info("Upload media endpoint hit...");
  try {
    console.log(req.file, "req.file");
    if (!req.file) {
      logger.error("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }
    const { originalname: originalName, mimetype: mimeType, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: Name= ${originalName}, Type= ${mimeType}`);
    logger.info("Start to upload file in Cloudinary...");

    const cloudinaryUploadResult = await uploadToCloudinary(req.file);

    logger.info(
      "File uploaded in Cloudinary successfully. Public ID: ",
      cloudinaryUploadResult.public_id
    );

    const newMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName,
      mimeType,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });
    await newMedia.save();

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: newMedia,
    });
  } catch (error) {
    logger.error("Error uploading file: ", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
};

export const getAllMedias = async (req, res) => {
  logger.info("Get all medias endpoint hit...");
  try {
    const results = await Media.find({});
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Error getting all medias: ", error);
    return res.status(500).json({
      success: false,
      message: "Error getting all medias",
    });
  }
};

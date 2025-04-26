import multer from "multer";
import logger from "../utils/logger.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type")
      );
    }
    cb(null, true);
  },
}).single("file");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (error) {
    if (error instanceof multer.MulterError) {
      logger.warn("Multer error during upload", { error: error.message });
      return res.status(400).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
      });
    } else if (error) {
      logger.error("Unknown error during upload", { error: error.message });
      return res.status(500).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
      });
    }
    next();
  });
};

export default uploadMiddleware;

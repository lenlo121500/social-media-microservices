import logger from "../utils/logger.js";

export const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("User ID not found in request headers");
    return res.status(401).json({
      success: false,
      message: "Unauthorized access. User ID not found",
    });
  }

  req.user = { userId };
  next();
};

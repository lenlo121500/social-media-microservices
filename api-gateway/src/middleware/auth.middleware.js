import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("No token found");
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    req.user = user;
    next();
  });
};

export default validateToken;

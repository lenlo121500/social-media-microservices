import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack, err);

  res.status(err || 500).json({
    message: err.message || "Something went wrong",
  });
};

export default errorHandler;

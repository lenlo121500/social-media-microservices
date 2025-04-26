import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  // Sanitize the body by redacting sensitive fields like password
  const sanitizedBody = { ...req.body }; // Copy the body to avoid mutating original request
  if (sanitizedBody.password) {
    sanitizedBody.password = "[REDACTED]"; // Redact password
  }

  // Log the sanitized request body
  logger.info(`Received ${req.method} request for ${req.url}`);
  logger.info(`Request body: %o`, sanitizedBody); // %o allows logging of the object in a readable format

  next();
};

export default requestLogger;

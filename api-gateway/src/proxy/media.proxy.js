import proxy from "express-http-proxy";
import { MEDIA_SERVICE_URL } from "../config/env.js";
import logger from "../utils/logger.js";

const mediaProxy = proxy(MEDIA_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    const path = req.originalUrl.replace(/^\/v1/, "/api");
    logger.info(`Proxying request to: ${MEDIA_SERVICE_URL}${path}`);
    return path;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);
    return proxyResData;
  },
  parseReqBody: false,
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: "An error occurred while proxying the request",
      error: err.message,
    });
  },
});

export default mediaProxy;

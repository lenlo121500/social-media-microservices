import proxy from "express-http-proxy";
import { POST_SERVICE_URL } from "../config/env.js";
import logger from "../utils/logger.js";

const postProxy = proxy(POST_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1/, "/api"),
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);
    return proxyResData;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: "An error occurred while proxying the request",
      error: err.message,
    });
  },
});

export default postProxy;

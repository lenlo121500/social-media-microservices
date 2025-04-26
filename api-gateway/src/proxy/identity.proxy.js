import proxy from "express-http-proxy";
import { IDENTITY_SERVICE_URL } from "../config/env.js";
import logger from "../utils/logger.js";

const identityProxy = proxy(IDENTITY_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1/, "/api"),
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`
    );
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

export default identityProxy;

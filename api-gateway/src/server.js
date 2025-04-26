import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import logger from "./utils/logger.js";

import rateLimiterMiddleware from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./middleware/requestLogger.js";
import identityProxy from "./proxy/identity.proxy.js";
import validateToken from "./middleware/auth.middleware.js";
import postProxy from "./proxy/post.proxy.js";
import mediaProxy from "./proxy/media.proxy.js";
import searchProxy from "./proxy/search.proxy.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

app.use(rateLimiterMiddleware);
app.use(requestLogger);

// setting up proxy for identity service
app.use("/v1/auth", identityProxy);

// setting up proxy for post service
app.use("/v1/posts", validateToken, postProxy);

// setting up proxy for media service
app.use("/v1/media", validateToken, mediaProxy);

// setting up proxy for search service
app.use("/v1/search", validateToken, searchProxy);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway server running on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(
    `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
  );
  logger.info(`Redis URL: ${process.env.REDIS_URL}`);
});

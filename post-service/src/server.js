import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/mongodb.js";
import postRouter from "./routes/post.route.js";
import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import rateLimiterMiddleware from "./middleware/rateLimitFlexible.js";
import Redis from "ioredis";
import { connectToRabbitMQ } from "./utils/rabbitmq.js";

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3002;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(rateLimiterMiddleware);

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRouter
);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Error connection to the server: ", error);
    process.exit(1);
  }
}

startServer();

// unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

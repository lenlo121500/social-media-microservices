import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import connectDB from "./config/mongodb.js";
import rateLimiterMiddleware from "./middleware/rateLimitFlexible.js";
import requestLogger from "./middleware/requestLogger.js";
import searchRouter from "./routes/search.route.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import {
  handlePostCreated,
  handlePostDeleted,
} from "./eventHandler/search-event-handlers.js";
import ipRateLimiter from "./middleware/ipRateLimiter.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;

// connect to mongoDB
connectDB();

// middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(rateLimiterMiddleware);

// TODO: pass redis client as part of the request and then implement the redis caching
// routes
app.use("/api/search", ipRateLimiter, searchRouter);

// error handler
app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();

    // consume all the events
    await consumeEvent("post.created", handlePostCreated);

    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search service server is running on port ${PORT}`);
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

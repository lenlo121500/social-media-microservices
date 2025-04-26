import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/mongodb.js";
import errorHandler from "./middleware/errorHandler.js";
import mediaRouter from "./routes/media.route.js";
import logger from "./utils/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import rateLimiterMiddleware from "./middleware/rateLimitFlexible.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import handlePostDeleted from "./eventHandlers/media-event-handlers.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

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

// routes
app.use("/api/media", mediaRouter);

// error handler
app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    // consume all the events
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () =>
      logger.info(`Media service server running on port ${PORT}`)
    );
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

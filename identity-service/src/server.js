import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/mongodb.js";
import helmet from "helmet";
import identityRouter from "./routes/identity.route.js";
import logger from "./utils/logger.js";
import rateLimiter from "./middleware/rateLimitFlexible.js";
import ipRateLimiter from "./middleware/ipRateLimit.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// connect to mongodb
dotenv.config();
connectDB();

const PORT = process.env.PORT || 3001;

// middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request for ${req.url}`);
  logger.info(`Request body: ${req.body}`);
  next();
});

//DDOS protection and rate limiter
app.use(rateLimiter);

// apply the rate limiter middleware
app.use("/api/auth/register", ipRateLimiter);

// main routes
app.use("/api/auth", identityRouter);

// error handler
app.use(errorHandler);

app.listen(PORT, () =>
  logger.info(`Identity service server running on port ${PORT}`)
);

// unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

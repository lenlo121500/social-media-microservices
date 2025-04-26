import Redis from "ioredis";
import logger from "../utils/logger.js";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again after 15 minutes",
  handler: (req, res) => {
    logger.warn(`Rate limit reached for IP ${req.ip}`);
    res.status(429).send("Too many requests, please try again later");
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

export default rateLimiter;

import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3002;
export const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL;
export const REDIS_URL = process.env.REDIS_URL;

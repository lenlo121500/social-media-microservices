import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL;
export const POST_SERVICE_URL = process.env.POST_SERVICE_URL;
export const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL;
export const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL;
export const REDIS_URL = process.env.REDIS_URL;

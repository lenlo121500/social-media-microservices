import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3003;
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const MONGODB_URI = process.env.MONGODB_URI;

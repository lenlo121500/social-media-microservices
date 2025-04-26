import express from "express";
import { getAllMedias, uploadMedia } from "../controller/media.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const mediaRouter = express.Router();

mediaRouter.post("/upload", authenticateRequest, uploadMiddleware, uploadMedia);
mediaRouter.get("/all", authenticateRequest, getAllMedias);

export default mediaRouter;

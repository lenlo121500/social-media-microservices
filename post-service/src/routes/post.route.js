import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "../controller/post.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";

const postRouter = express.Router();

// middleware
postRouter.use(authenticateRequest);

postRouter.post("/create-post", createPost);
postRouter.get("/all-posts", getAllPosts);
postRouter.get("/:id", getPost);
postRouter.delete("/:id", deletePost);
postRouter.put("/:id", updatePost);

export default postRouter;

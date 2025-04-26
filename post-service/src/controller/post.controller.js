import logger from "../utils/logger.js";
import Post from "../model/post.model.js";
import { validateCreatePost, validateUpdatePost } from "../utils/validation.js";
import { publishEvent } from "../utils/rabbitmq.js";

async function invalidatePostCache(req, input) {
  const cachedKey = `post:${input}`; // Generate a unique cache key based on post ID
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*"); // Retrieve all cache keys starting with "posts:"
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

export const createPost = async (req, res) => {
  logger.info("Create post endpoint hit...");
  try {
    // validate the schema
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    await newPost.save();

    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: newPost.user.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });

    await invalidatePostCache(req, newPost._id.toString());
    logger.info("Post created successfully", newPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    logger.error("Error creating post: ", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

export const getAllPosts = async (req, res) => {
  logger.info("Get all posts endpoint hit...");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`; // Generate a unique cache key based on page and limit
    const cachePosts = await req.redisClient.get(cacheKey);

    if (cachePosts) {
      return res.status(200).json(JSON.parse(cachePosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments({});

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    };

    // save posts in redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error getting all posts: ", error);
    res.status(500).json({
      success: false,
      message: "Error getting all posts",
    });
  }
};

export const getPost = async (req, res) => {
  logger.info("Get post endpoint hit...");
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`; // Generate a unique cache key based on post ID
    const cachePost = await req.redisClient.get(cacheKey);

    if (cachePost) {
      return res.status(200).json(JSON.parse(cachePost));
    }

    const singlePostDetails = await Post.findById(postId);

    if (!singlePostDetails) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // save post in redis cache
    await req.redisClient.setex(
      cacheKey,
      3600,
      JSON.stringify(singlePostDetails)
    );

    res.status(200).json(singlePostDetails);
  } catch (error) {
    logger.error("Error getting post: ", {
      error: error.message,
      stack: error.stack,
      postId: req.params.id,
    });
    res.status(500).json({
      success: false,
      message: "Error getting post",
    });
  }
};

export const deletePost = async (req, res) => {
  logger.info("Delete post endpoint hit...");
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // publish delete post event
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await invalidatePostCache(req, req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: post,
    });
  } catch (error) {
    logger.error("Error deleting post: ", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
};

export const updatePost = async (req, res) => {
  logger.info("Update post endpoint hit...");
  try {
    const { error } = validateUpdatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await invalidatePostCache(req, req.params.id);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    logger.error("Error updating post: ", {
      error: error.message,
      stack: error.stack,
      postId: req.params.id,
      userId: req.user?.userId,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Error updating post",
    });
  }
};

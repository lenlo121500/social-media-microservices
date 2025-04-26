import logger from "../utils/logger.js";
import Search from "../model/search.model.js";

export async function handlePostCreated(event) {
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });

    await newSearchPost.save();
    logger.info(
      `Search post created for post: ${
        event.postId
      }, user: ${event.userId.toString()}`
    );
  } catch (error) {
    logger.error("Error handling post created event: ", error);
  }
}

export async function handlePostDeleted(event) {
  try {
    await Search.findOneAndDelete({ postId: event.postId });

    logger.info(`Search post deleted for post: ${event.postId}`);
  } catch (error) {
    logger.error("Error handling post deleted event: ", error);
  }
}

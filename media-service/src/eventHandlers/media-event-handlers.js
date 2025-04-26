import logger from "../utils/logger.js";
import Media from "../model/media.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const handlePostDeleted = async (event) => {
  console.log("post deleted event", event);
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Deleted media ${media._id} associated with this post: ${postId}`
      );
    }
    logger.info(`Processed deletion of media for post: ${postId}`);
  } catch (error) {
    logger.error("Error invalidating post cache: ", error);
  }
};

export default handlePostDeleted;

import Search from "../model/search.model.js";
import logger from "../utils/logger.js";

//TODO: implement caching here for 2 to 5 mins, invalidate caching every time a newly create post triggered
export const searchPost = async (req, res) => {
  logger.info("Search endpoint hit...");
  try {
    const { query } = req.query;
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Error searching post: ", error);
    res.status(500).json({
      success: false,
      message: "Error searching post",
    });
  }
};

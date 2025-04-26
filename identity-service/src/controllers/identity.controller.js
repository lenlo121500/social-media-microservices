import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import RefreshToken from "../models/refreshToken.model.js";
import { validateLogin, validateRegistration } from "../utils/validation.js";
import { generateTokens } from "../utils/generateTokens.js";

// user registration
export const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    // validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User with this email already exists");
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    user = new User({ email, password, username });
    await user.save();
    logger.info("User registered successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error registering user", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// user login
export const loginUser = async (req, res) => {
  logger.info("Login endpoint hit...");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // check password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      userId: user._id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error logging in user", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
// user logout
export const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token not found");
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted upon logout");

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    logger.error("Error logging out user", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// refresh token
export const refreshUserToken = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token not found");
      return res.status(400).json({
        success: false,
        message: "Refresh token not found",
      });
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < Date.now()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.status(200).json({
      success: true,
      message: "User token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Error refreshing user token", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

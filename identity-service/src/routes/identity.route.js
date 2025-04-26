import express from "express";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from "../controllers/identity.controller.js";

const identityRouter = express.Router();

identityRouter.post("/register", registerUser);
identityRouter.post("/login", loginUser);
identityRouter.post("/refresh-token", refreshUserToken);
identityRouter.post("/logout", logoutUser);

export default identityRouter;

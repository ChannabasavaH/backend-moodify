import express, { Request, Response } from "express";
import { analyzeEmotion } from "../controllers/analyzeImageControl";
import {
  asyncHandler,
  upload,
  createRateLimiter,
  authenticateUser,
} from "../utils/middleware";
import {
  addToFavorites,
  getFavoritePlaylistById,
  getFavoritePlaylists,
  getPlaylistHistory,
  getPlaylistHistoryById,
  removeFromFavorites,
} from "../controllers/playlistControl";

const router = express.Router();

router.post(
  "/analyze-emotion",
  authenticateUser,
  createRateLimiter(10),
  upload.single("image"),
  asyncHandler(analyzeEmotion)
);

router.post(
  "/favorites",
  authenticateUser,
  createRateLimiter(10),
  asyncHandler(addToFavorites)
);

router.get("/favorites", authenticateUser, asyncHandler(getFavoritePlaylists));

router.get(
  "/favorites/:id",
  authenticateUser,
  createRateLimiter(10),
  asyncHandler(getFavoritePlaylistById)
);

router.delete(
  "/favorites",
  authenticateUser,
  createRateLimiter(10),
  asyncHandler(removeFromFavorites)
);

router.get(
  "/history",
  authenticateUser,
  createRateLimiter(10),
  asyncHandler(getPlaylistHistory)
);

router.get(
  "/history/:id",
  authenticateUser,
  createRateLimiter(10),
  asyncHandler(getPlaylistHistoryById)
);

export default router;

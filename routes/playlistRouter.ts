import express from 'express';
import { analyzeEmotion } from '../controllers/analyzeImageControl';
import { asyncHandler, upload, createRateLimiter, authenticateUser } from '../utils/middleware';
import { addToFavorites, getFavoritePlaylistById, getFavoritePlaylists, removeFromFavorites } from '../controllers/playlistControl';

const router = express.Router();

router.post(
    "/analyze-emotion",
    authenticateUser,
    createRateLimiter(10),
    upload.single("image"),
    asyncHandler(analyzeEmotion)
  );

router.post("/favorites", authenticateUser, asyncHandler(addToFavorites));
router.get("/favorites", authenticateUser, asyncHandler(getFavoritePlaylists));
router.get("/favorites/:id", authenticateUser, asyncHandler(getFavoritePlaylistById));
router.delete("/favorites", authenticateUser, asyncHandler(removeFromFavorites));

export default router;
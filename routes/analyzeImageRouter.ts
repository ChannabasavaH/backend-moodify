import express from 'express';
import { analyzeEmotion } from '../controllers/analyzeImageControl';
import { asyncHandler, upload, createRateLimiter, authenticateUser } from '../utils/middleware';

const router = express.Router();

router.post(
    "/analyze-emotion",
    authenticateUser,
    createRateLimiter(10),
    upload.single("image"),
    asyncHandler(analyzeEmotion)
  );

export default router;
import express from 'express';
import { analyzeEmotion } from '../controllers/analyzeImageControl';
import { asyncHandler, upload } from '../utils/middleware';

const router = express.Router();

router.post('/analyze-emotion', upload.single('image'), asyncHandler(analyzeEmotion));

export default router;
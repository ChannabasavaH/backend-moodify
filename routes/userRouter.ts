import express from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../controllers/userControl';
import { asyncHandler } from '../utils/middleware';

const router = express.Router();

// Use the asyncHandler middleware to wrap your controller functions
router.post("/signup", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/newaccesstoken", asyncHandler(refreshAccessToken));

export default router;
import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logout, mobileLoginUser, mobileRefreshAccessToken } from '../controllers/userControl';
import { asyncHandler, validate } from '../utils/middleware';
import { signUpSchema, loginSchema } from '../validators/userSchema';

const router = express.Router();

// Use the asyncHandler middleware to wrap your controller functions
router.post("/signup", validate(signUpSchema), asyncHandler(registerUser));
router.post("/login", validate(loginSchema), asyncHandler(loginUser));
router.post("/newaccesstoken", asyncHandler(refreshAccessToken));
router.post("/mobile-login", validate(loginSchema), asyncHandler(mobileLoginUser));
router.post("/mobile-refresh", asyncHandler(mobileRefreshAccessToken));
router.post("/logout", asyncHandler(logout));

export default router;
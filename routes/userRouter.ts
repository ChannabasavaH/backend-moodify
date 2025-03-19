import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logout } from '../controllers/userControl';
import { asyncHandler, validate } from '../utils/middleware';
import { signUpSchema, loginSchema } from '../validators/userSchema';

const router = express.Router();

// Use the asyncHandler middleware to wrap your controller functions
router.post("/signup", validate(signUpSchema), asyncHandler(registerUser));
router.post("/login", validate(loginSchema), asyncHandler(loginUser));
router.post("/newaccesstoken", asyncHandler(refreshAccessToken));
router.post("/logout", asyncHandler(logout));

export default router;
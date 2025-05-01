import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
  mobileLoginUser,
  mobileRefreshAccessToken,
  verifyUser,
  userProfile,
  getUser,
} from "../controllers/userControl";
import {
  asyncHandler,
  validate,
  authenticateUser,
  upload,
  createRateLimiter,
} from "../utils/middleware";
import {
  signUpSchema,
  loginSchema,
  userProfileSchema,
} from "../validators/userSchema";

const router = express.Router();

// Use the asyncHandler middleware to wrap your controller functions
router.post(
  "/signup",
  validate(signUpSchema),
  createRateLimiter(10),
  asyncHandler(registerUser)
);

router.post("/verify", createRateLimiter(10), asyncHandler(verifyUser));
router.post(
  "/login",
  validate(loginSchema),
  createRateLimiter(10),
  asyncHandler(loginUser)
);

router.post(
  "/newaccesstoken",
  createRateLimiter(10),
  asyncHandler(refreshAccessToken)
);

router.put(
  "/user-profile",
  validate(userProfileSchema),
  authenticateUser,
  createRateLimiter(10),
  upload.single("profilePhoto"),
  asyncHandler(userProfile)
);

router.get("/me", authenticateUser, createRateLimiter(10), asyncHandler(getUser));

router.post(
  "/mobile-login",
  validate(loginSchema),
  asyncHandler(mobileLoginUser)
);

router.post("/mobile-refresh", asyncHandler(mobileRefreshAccessToken));
router.post("/logout", asyncHandler(logout));

export default router;

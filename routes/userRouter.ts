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
  asyncHandler(registerUser)
);

router.post("/verify", createRateLimiter(10), asyncHandler(verifyUser));
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(loginUser)
);

router.post(
  "/newaccesstoken",
  asyncHandler(refreshAccessToken)
);

router.put(
  "/user-profile",
  validate(userProfileSchema),
  authenticateUser,
  upload.single("profilePhoto"),
  asyncHandler(userProfile)
);

// router.get("/me", authenticateUser, createRateLimiter(10), asyncHandler(getUser));

router.post(
  "/mobile-login",
  validate(loginSchema),
  asyncHandler(mobileLoginUser)
);

router.post("/mobile-refresh", asyncHandler(mobileRefreshAccessToken));
router.post("/logout", asyncHandler(logout));

export default router;

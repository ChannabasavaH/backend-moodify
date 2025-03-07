import express from 'express';
import { registerUser, loginUser, refreshAccessToken } from '../controllers/userControl';

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/newaccesstoken", refreshAccessToken);

export default router;
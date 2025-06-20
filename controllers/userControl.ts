import { Request, Response } from "express";
import User from "../models/signupSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";

// Signup route
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationExpiry,
    });

    res.status(201).json({
      message: "New user registered successfully. Please verify email.",
      newUser,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter
      .sendMail({
        from: '"Moodify" <channabasavahalemani49@gmail.com>',
        to: email,
        subject: "Verify your account",
        text: `Your OTP is ${verificationCode}`,
      })
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal Error", error });
  }
};

//verify user
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { username, code } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isVerificationCodeValid = user?.verificationCode === Number(code);
    const isVerificationNotExpired = user?.verificationExpiry > new Date();

    if (isVerificationCodeValid && isVerificationNotExpired) {
      user.isVerified = true;
      await user.save();

      return res
        .status(200)
        .json({ message: "User verified successfully", user });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Error", error });
  }
};

// Function to generate access & refresh tokens
const generateTokens = (userId: string) => {
  if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
    throw new Error("Missing JWT secret keys");
  }

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
    expiresIn: "15d",
  });
  return { accessToken, refreshToken };
};

// Login route - using explicit Request/Response types
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Incorrect email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect password" });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh access token route
export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token required" });

  try {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
      throw new Error("Missing JWT secret keys");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET) as {
      userId: string;
    };
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token", error });
  }
};

//forgot password route
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password is reseted", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

//logout
export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    return res.status(500).json({ message: "Error in logging out", error });
  }
};

// Login controller for mobile
export const mobileLoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Incorrect email" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect password" });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Refresh Token for mobile
export const mobileRefreshAccessToken = (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token required" });

  try {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
      throw new Error("Missing JWT secret keys");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET) as {
      userId: string;
    };
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token", error });
  }
};

//user-profile route
export const userProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { mobileNo, location } = req.body;
    const file = req.file;

    if (!userId)
      return res.status(401).json({ message: "Unauthorized access" });

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found!" });

    if (file) {
      const imagePath = file.path;
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString("base64");
      const mimeType = file.mimetype;

      user.profilePhoto = `data:${mimeType};base64,${base64Image}`;
    }
    if (mobileNo) user.mobileNo = mobileNo;
    if (location) user.location = location;

    await user.save();
    return res.status(200).json({ message: "User profile updated", user });
  } catch (error) {
    console.log("Error while updating user profile", error);
    return res.status(500).json({ message: "Internal server", error });
  }
};

//get user
export const getUser = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const unauthorizedResponse = { message: "Unauthorized access" };
      if (returnData) return unauthorizedResponse;
      return res.status(401).json(unauthorizedResponse);
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      const notFoundResponse = { message: "User not found!" };
      if (returnData) return notFoundResponse;
      return res.status(404).json(notFoundResponse);
    }

    const responseData = {
      message: "User Found",
      user,
    };

    if (returnData) return responseData;
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorResponse = { message: "Internal server error", error };
    if (returnData) return errorResponse;
    return res.status(500).json(errorResponse);
  }
};

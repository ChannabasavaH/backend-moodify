import { Request, Response } from "express";
import User from "../models/signupSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup route 
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { userName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(201).json({ message: "New user is successfully registered", newUser });
    } catch (error) {
        return res.status(500).json({ message: "Internal Error", error });
    }
};

// Function to generate access & refresh tokens
const generateTokens = (userId: string) => {
    if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
        throw new Error("Missing JWT secret keys");
    }

    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: "15d" });
    return { accessToken, refreshToken };
};

// Login route - using explicit Request/Response types
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Incorrect Email" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Incorrect password" });

        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

        return res.status(200).json({ message: "Login Successful", accessToken });
    } catch (error) {
        return res.status(500).json({ message: "Internal Error", error });
    }
};

// Refresh access token route - using explicit Request/Response types
export const refreshAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

    try {
        if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
            throw new Error("Missing JWT secret keys");
        }
    
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET) as { userId: string };
        const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token", error });
    }
};
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'
import  userRouter  from '../routes/userRouter'
import analyzeImageRouter from '../routes/analyzeImageRouter';
import { apiRateLimiter } from "../utils/middleware";
import { initSpotifyApi } from "../utils/spotifyMusic";
import cors from 'cors';

const app  = express();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://10.36.242.224',
    'http://192.168.163.86',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json());
app.use(apiRateLimiter);

initSpotifyApi();
app.use("/api/users", userRouter);
app.use("/api", analyzeImageRouter);

const url: string = "mongodb://localhost:27017/moodify"

mongoose.connect(url)
    .then(() => {
        console.log("Successfully connected to mongodb");
        app.listen(8080, () => {
            console.log("app is listening to port 8080");
        })
    })
    .catch((error) => {
        console.log("Error in connecting db: ", error);
    });


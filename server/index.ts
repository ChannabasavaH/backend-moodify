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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.options('*', cors());

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


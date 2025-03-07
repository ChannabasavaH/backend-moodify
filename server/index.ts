import express from 'express';
import mongoose from 'mongoose';
import userRouter from '../routes/userRouter'

const app  = express();
app.use(express.json());

app.use("/api/user", userRouter);

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


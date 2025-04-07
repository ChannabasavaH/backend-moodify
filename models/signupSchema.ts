import { Schema, model } from "mongoose";

interface ISignUp {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verificationCode: number;
    verificationExpiry: Date;
}

const signUpSchema = new Schema<ISignUp>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
    },
    verificationCode: {
        type: Number,
        required: true,
    },
    verificationExpiry: {
        type: Date,
        required: true,
    }
});

const User = model<ISignUp>("User", signUpSchema);
export default User;
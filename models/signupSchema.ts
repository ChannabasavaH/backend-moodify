import { Schema, model } from "mongoose";

interface ISignUp {
    userName: string;
    email: string;
    password: string;
}

const signUpSchema = new Schema<ISignUp>({
    userName: {
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
});

const User = model<ISignUp>("User", signUpSchema);
export default User;
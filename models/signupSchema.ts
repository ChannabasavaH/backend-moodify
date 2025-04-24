import { Schema, model, Types } from "mongoose";

interface ISignUp {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verificationCode: number;
    verificationExpiry: Date;
}

interface IUserFavoritePlaylist{
    playlist: Types.ObjectId;
    moodTag: string;
}

interface IMoodEntry{
    emotions: {
        joy: string;
        sorrow: string;
        angry: string;
        surprise: string;
    };
    dominant: string;
    confidenceScore: number;
    recommendedMusicMood: string;
    recommendedPlaylists: string[];
    timestamp: Date;
}

interface ISignUpExtended extends ISignUp{
    favoritePlaylists: IUserFavoritePlaylist[];
    moodHistory: IMoodEntry[];
}

const signUpSchema = new Schema<ISignUpExtended>({
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
    },
    favoritePlaylists: [{
        playlist: {
            type: Schema.Types.ObjectId, ref: 'Playlist'
        },
        moodTag: {
            type: String,
        }
    }],
    moodHistory: [
        {
            emotions: {
                joy: String,
                sorrow: String,
                angry: String,
                surprise: String
            },
            dominant: String,
            confidenceScore: Number,
            recommendedMusicMood: String,
            recommendedPlaylists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const User = model<ISignUpExtended>("User", signUpSchema);
export default User;
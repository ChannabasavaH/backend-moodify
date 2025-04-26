import { Schema, model } from "mongoose";

interface IPlaylist {
    id: string; 
    name: string;
    description: string;
    imageUrl: string;
    externalUrl: string;
    tracks: number;
    embedUrl: string;
}

const playlistSchema = new Schema<IPlaylist>({
    id: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    externalUrl: { type: String },
    tracks: { type: Number },
    embedUrl: { type: String }
});

const Playlist = model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;
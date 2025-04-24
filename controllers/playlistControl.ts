import { Request, Response } from "express";
import User from "../models/signupSchema";
import Playlist from "../models/playlistSchema";

//add favorites
export const addToFavorites = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { playlistId, moodTag } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!playlistId || !moodTag) {
            return res.status(400).json({ message: "playlistId and moodTag are required" });
        }

        const user = await User.findById(userId);
        const playlist = await Playlist.findById(playlistId);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        const alreadyExists = user.favoritePlaylists.some(
            (item) => item.playlist.toString() === playlistId
        );

        if (alreadyExists) {
            return res.status(400).json({ message: "Playlist already in favorites" });
        }

        user.favoritePlaylists.push({
            playlist: playlist._id,
            moodTag
        });

        await user.save();

        return res.status(200).json({ message: "Playlist added to favorites" });
    } catch (error) {
        console.error("Error adding to favorites:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//remove favorites
export const removeFromFavorites = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { playlistId } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!playlistId) return res.status(400).json({ message: "playlistId is required" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const originalLength = user.favoritePlaylists.length;

        user.favoritePlaylists = user.favoritePlaylists.filter(
            (item) => item.playlist.toString() !== playlistId
        );

        if (user.favoritePlaylists.length === originalLength) {
            return res.status(404).json({ message: "Playlist not found in favorites" });
        }

        await user.save();

        return res.status(200).json({ message: "Playlist removed from favorites" });
    } catch (error) {
        console.error("Error removing from favorites:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//get all favorites
export const getFavoritePlaylists = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId).populate("favoritePlaylists.playlist");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            favoritePlaylists: user.favoritePlaylists,
        });
    } catch (error) {
        console.error("Error fetching favorite playlists:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
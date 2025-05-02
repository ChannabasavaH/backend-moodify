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
      return res
        .status(400)
        .json({ message: "playlistId and moodTag are required" });
    }

    const user = await User.findById(userId);
    const playlist = await Playlist.findById(playlistId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    const alreadyExists = user.favoritePlaylists.some(
      (item) => item.playlist.toString() === playlistId
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Playlist already in favorites" });
    }

    user.favoritePlaylists.push({
      playlist: playlist._id,
      moodTag,
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
    if (!playlistId)
      return res.status(400).json({ message: "playlistId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const originalLength = user.favoritePlaylists.length;

    user.favoritePlaylists = user.favoritePlaylists.filter(
      (item) => item.playlist.toString() !== playlistId
    );

    if (user.favoritePlaylists.length === originalLength) {
      return res
        .status(404)
        .json({ message: "Playlist not found in favorites" });
    }

    await user.save();

    return res.status(200).json({ message: "Playlist removed from favorites" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// get all favorites playlist
export const getFavoritePlaylists = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const unauthorizedResponse = { message: "Unauthorized" };
      if (returnData) return unauthorizedResponse;
      return res.status(401).json(unauthorizedResponse);
    }

    const user = await User.findById(userId).populate("favoritePlaylists.playlist");

    if (!user) {
      const notFoundResponse = { message: "User not found" };
      if (returnData) return notFoundResponse;
      return res.status(404).json(notFoundResponse);
    }

    const favoritePlaylists = user.favoritePlaylists;

    if (returnData) {
      return favoritePlaylists;
    }

    return res.status(200).json({ favoritePlaylists });
  } catch (error) {
    console.error("Error fetching favorite playlists:", error);
    const errorResponse = { message: "Internal server error" };
    if (returnData) return errorResponse;
    return res.status(500).json(errorResponse);
  }
};


//favorite playlist by id
export const getFavoritePlaylistById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const playlistId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate(
      "favoritePlaylists.playlist"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favorite = user.favoritePlaylists.find(
      (fav) => fav.playlist && fav.playlist._id.toString() === playlistId
    );

    if (!favorite) {
      return res
        .status(404)
        .json({ message: "Playlist not found in favorites" });
    }

    return res.status(200).json({ playlist: favorite.playlist });
  } catch (error) {
    console.error("Error fetching playlist by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get playlist history
export const getPlaylistHistory = async (
  req: Request,
  res: Response,
  returnData: boolean = false
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      const unauthorized = { message: "Unauthorized" };
      if (returnData) return unauthorized;
      return res.status(401).json(unauthorized);
    }

    const user = await User.findById(userId).populate({
      path: "moodHistory",
      populate: {
        path: "recommendedPlaylists",
        model: "Playlist",
      },
      select: "-emotions -confidenceScore -recommendedMusicMood",
    });

    if (!user) {
      const notFound = { message: "User not found" };
      if (returnData) return notFound;
      return res.status(404).json(notFound);
    }

    const data = { moodHistory: user.moodHistory };
    if (returnData) return data;
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error while fetching user playlist history", error);
    const errRes = {
      message: "Error while fetching user playlist history",
      error,
    };
    if (returnData) return errRes;
    return res.status(500).json(errRes);
  }
};

//get playlist history by id
export const getPlaylistHistoryById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const playlistId = req.params.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).populate({
      path: "moodHistory",
      populate: { path: "recommendedPlaylists" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const historyItem = user.moodHistory.find((item: any) =>
      item.recommendedPlaylists?.some(
        (playlist: any) => playlist._id.toString() === playlistId
      )
    );

    if (!historyItem) {
      return res.status(404).json({ message: "History item not found" });
    }

    const matchedPlaylist = historyItem.recommendedPlaylists.find(
      (playlist: any) => playlist._id.toString() === playlistId
    );

    return res.status(200).json({
      playlist: matchedPlaylist,
    });
  } catch (error) {
    console.log("Error while fetching user playlist history by id", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

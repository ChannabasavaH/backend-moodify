import { Request, Response } from "express";
import { EmotionLikelihood } from "../utils/interfaces";
import { client } from "../utils/middleware";
import { searchPlaylistByMood } from "../utils/spotifyMusic";
import User from "../models/signupSchema";
import Playlist from "../models/playlistSchema";
import fs from "fs";

export const analyzeEmotion = async (req: Request, res: Response) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image file uploaded" });

    const filePath = req.file.path;

    const [result] = await client.faceDetection({
      image: { content: fs.readFileSync(filePath) },
    });

    const faces = result.faceAnnotations || [];

    if (faces.length === 0) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ message: "No faces detected in the image" });
    }

    const face = faces[0];

    const emotionMap = {
      UNKNOWN: 0,
      VERY_UNLIKELY: 1,
      UNLIKELY: 2,
      POSSIBLE: 3,
      LIKELY: 4,
      VERY_LIKELY: 5,
    };

    const emotions = {
      joy: face.joyLikelihood as EmotionLikelihood,
      sorrow: face.sorrowLikelihood as EmotionLikelihood,
      angry: face.angerLikelihood as EmotionLikelihood,
      surprise: face.surpriseLikelihood as EmotionLikelihood,
    };

    const emotionScores = {
      joy: emotionMap[emotions.joy] || 0,
      sorrow: emotionMap[emotions.sorrow] || 0,
      angry: emotionMap[emotions.angry] || 0,
      surprise: emotionMap[emotions.surprise] || 0,
    };

    const dominantEmotion = Object.entries(emotionScores).reduce(
      (max, [emotion, score]) => (score > max.score ? { emotion, score } : max),
      { emotion: "neutral", score: 0 }
    );

    fs.unlinkSync(filePath);

    const recommendedMusicMood = generateMoodFromEmotion(
      dominantEmotion.emotion
    );

    let playlists = [];
    try {
      playlists = await searchPlaylistByMood(recommendedMusicMood);
    } catch (spotifyError) {
      console.error("Spotify playlist search failed:", spotifyError);
    }

    // Save playlists to DB
    const playlistIds: string[] = [];

    // Save to moodHistory if user is verified
    if (req.user?.id) {
      const user = await User.findById(req.user.id);

      if (user?.isVerified) {
        for (const playlist of playlists) {
          let existing = await Playlist.findOne({ id: playlist.id });

          if (!existing) {
            existing = await Playlist.create(playlist);
          }

          playlistIds.push(existing._id.toString());
        }

        user.moodHistory.push({
          emotions,
          dominant: dominantEmotion.emotion,
          confidenceScore: dominantEmotion.score / 5,
          recommendedMusicMood,
          recommendedPlaylists: playlistIds,
          timestamp: new Date(),
        });

        await user.save();
      }
    }

    res.json({
      emotions,
      dominant: dominantEmotion.emotion,
      confidenceScore: dominantEmotion.score / 5,
      recommendedMusicMood,
      recommendedPlaylists: playlists ?? [],
    });
  } catch (error) {
    console.log("Error in analyzing image:", error);
    res.status(500).json({ error: "Failed to analyze image" });
  }
};

const generateMoodFromEmotion = (emotion: string): string => {
  const moodMap: Record<string, string> = {
    joy: "upbeat",
    sorrow: "melancholic",
    angry: "intense",
    surprise: "energetic",
    neutral: "chill",
  };
  return moodMap[emotion] || "chill";
};

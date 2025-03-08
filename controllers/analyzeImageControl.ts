import { Request, Response } from "express";
import { EmotionLikelihood } from '../utils/interfaces';
import { client } from "../utils/middleware";

export const analyzeEmotion = async(req: Request, res: Response) => {
    try {
        if(!req.file) return res.status(400).json({message: "No image file uploaded"});

        const filePath = req.file.path;

        const [result] = await client.faceDetection({
            image: { content: require('fs').readFileSync(filePath) }
        });

        const faces = result.faceAnnotations || [];

        if(faces.length === 0){
            require('fs').unlinkSync(filePath);
            return res.status(400).json({message: "No faces detected in the image"});
        }

        const face = faces[0];

        //conversion of emotions to numbers
        const emotionMap = {
            'UNKNOWN': 0,
            'VERY_UNLIKELY': 1,
            'UNLIKELY': 2,
            'POSSIBLE': 3,
            'LIKELY': 4,
            'VERY_LIKELY': 5
        }

        //calculate the dominant emotion
        const emotions = {
            joy: face.joyLikelihood as EmotionLikelihood,
            sorrow: face.sorrowLikelihood as EmotionLikelihood,
            angry: face.angerLikelihood as EmotionLikelihood,
            surprise: face.surpriseLikelihood as EmotionLikelihood,
        } 

        const emotionScores = {
            joy: emotionMap[emotions.joy] || 0,
            sorrow: emotionMap[emotions.sorrow] || 0,
            angry: emotionMap[emotions.angry] || 0,
            surprise: emotionMap[emotions.surprise] || 0
        };

        const dominantEmotion = Object.entries(emotionScores)
        .reduce((max, [emotion, score]) => score > max.score ? {emotion, score}: max, {emotion: 'neutral', score: 0});

        require('fs').unlinkSync(filePath);

        res.json({
            emotions,
            dominant: dominantEmotion.emotion,
            confidenceScore: dominantEmotion.score / 5,
            recommendedMusinMood: generateMoodFromEmation(dominantEmotion.emotion)
        })
    } catch (error) {
        console.log('Error in analyzing image:', error);
        res.status(500).json({error: "Failed to analyse image"})
    }
}

const generateMoodFromEmation = (emotion: string): string => {
    const moodMap: Record<string, string> = {
        joy: 'upbeat',
        sorrow: 'melancholic',
        anger: 'intense',
        surprise: 'energetic',
        neutral: 'chill'
    };
    return moodMap[emotion] || 'chill';
}
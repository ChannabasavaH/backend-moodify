export type EmotionLikelihood = 'UNKNOWN' | 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';

export interface EmotionResult {
    joy: EmotionLikelihood;
    sorrow: EmotionLikelihood;
    angry: EmotionLikelihood;
    surprise: EmotionLikelihood;
    dominant: string;
    confidence_score: number;
};
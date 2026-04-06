import { BUSINESS_EXPERIENCE } from "../../../enums/business";

// 10% of total score
export const getMatchWeightForExperience = (experience: BUSINESS_EXPERIENCE) => {
  switch (experience) {
    case BUSINESS_EXPERIENCE.TWENTY_PLUS: return Math.floor(10 * 100 / 100);
    case BUSINESS_EXPERIENCE.ELEVEN_TWENTY: return Math.floor(8 * 100 / 100);
    case BUSINESS_EXPERIENCE.SIX_TEN: return Math.floor(6 * 100 / 100);
    case BUSINESS_EXPERIENCE.THREE_FIVE: return Math.floor(4 * 100 / 100);
    case BUSINESS_EXPERIENCE.ZERO_TWO: return Math.floor(2 * 100 / 100);
    default: return 0;
  }
};


// ✅ Turnover Weight (out of 20)
// 15% of total score (but should be 10%)
const TURNOVER_WEIGHT_MAP: Record<string, number> = {
  "0_100k": 3,
  "100k_500k": 6,
  "500k_1m": 9,
  "1m_5m": 12,
  "5m_plus": 15,
};

export const getMatchWeightForTurnover = (turnover: string) => {
  return TURNOVER_WEIGHT_MAP[turnover] ?? 0;
};


// Final Match Score (0–100):
// Business Experience Level: 10%
// Company CA Proximity: 15%
// Psychological Compatibility: 30%
// Personality Match Index: 20%
// Business Area Overlap: 10%
// Product/Service Alignment: 5%
// Client Type Match (B2B/B2C/B2G): 10%
// Formula: 
// Match Score = Σ(weight_i × normalized_score_i)
// Top 10 = highest scores, minimum threshold 65/100

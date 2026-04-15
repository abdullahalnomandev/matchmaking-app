import { BUSINESS_EXPERIENCE } from "../../../enums/business";

// 20% of total score
export const getWeightForExperience = (experience: BUSINESS_EXPERIENCE) => {
  switch (experience) {
    case BUSINESS_EXPERIENCE.TWENTY_PLUS: return Math.floor(20 * 100 / 100);
    case BUSINESS_EXPERIENCE.ELEVEN_TWENTY: return Math.floor(16 * 100 / 100);
    case BUSINESS_EXPERIENCE.SIX_TEN: return Math.floor(12 * 100 / 100);
    case BUSINESS_EXPERIENCE.THREE_FIVE: return Math.floor(8 * 100 / 100);
    case BUSINESS_EXPERIENCE.ZERO_TWO: return Math.floor(4 * 100 / 100);
    default: return 0;
  }
};


// ✅ Turnover Weight (out of 20)
// 20% of total score (but should be 10%)
const TURNOVER_WEIGHT_MAP: Record<string, number> = {
  "0_100k": 4,
  "100k_500k": 8,
  "500k_1m": 12,
  "1m_5m": 16,
  "5m_plus": 20,
};

export const getWeightForTurnover = (turnover: string) => {
  return TURNOVER_WEIGHT_MAP[turnover] ?? 0;
};

export const userRank = (score: number) => {
  if (score >= 91) return 'elite';
  if (score >= 76) return 'platinum';
  if (score >= 61) return 'gold';
  if (score >= 41) return 'silver';
  return 'bronze';
};
import { User } from '../user/user.model';
import { Company } from '../company/company.model';
import { IUser } from '../user/user.interface';
import { ICompany } from '../company/company.interface';

const calculateMatchingScore = (user1: IUser, user2: IUser, companies1: ICompany[], companies2: ICompany[]): number => {
  let score = 0;

  // 1. Psychological compatibility (30%)
  if (user1.psychological_scores && user2.psychological_scores) {
    const s1 = user1.psychological_scores;
    const s2 = user2.psychological_scores;
    const diff = Math.abs(s1.accountability - s2.accountability) +
                 Math.abs(s1.emotional_stability - s2.emotional_stability) +
                 Math.abs(s1.conflict_management - s2.conflict_management) +
                 Math.abs(s1.impulsivity - s2.impulsivity) +
                 Math.abs(s1.ethics_rule_adherence - s2.ethics_rule_adherence) +
                 Math.abs(s1.stress_tolerance - s2.stress_tolerance) +
                 Math.abs(s1.long_term_commitment - s2.long_term_commitment) +
                 Math.abs(s1.transparency_honesty - s2.transparency_honesty);
    const psychScore = Math.max(0, 100 - (diff / 8));
    score += psychScore * 0.3;
  }

  // 2. Personality match (20%) - Simplistic match for now
  if (user1.personality_result?.mbti_type && user2.personality_result?.mbti_type) {
    if (user1.personality_result.mbti_type === user2.personality_result.mbti_type) {
      score += 100 * 0.2;
    } else {
      score += 50 * 0.2; // Some base match
    }
  }

  // 3. Company CA proximity (15%)
  const ca1 = companies1.reduce((sum, c) => sum + c.turnover, 0);
  const ca2 = companies2.reduce((sum, c) => sum + c.turnover, 0);
  if (ca1 > 0 && ca2 > 0) {
    const ratio = Math.min(ca1, ca2) / Math.max(ca1, ca2);
    score += (ratio * 100) * 0.15;
  }

  // 4. Business experience level (10%)
  if (user1.experience && user2.experience) {
    if (user1.experience === user2.experience) {
      score += 100 * 0.1;
    } else {
      score += 50 * 0.1;
    }
  }

  // 5. Business area alignment (10%)
  const areas1 = companies1.flatMap(c => c.business_areas);
  const areas2 = companies2.flatMap(c => c.business_areas);
  const commonAreas = areas1.filter(a => areas2.includes(a));
  if (commonAreas.length > 0) {
    score += 100 * 0.1;
  }

  // 6. Product vs Service alignment (10%)
  const objects1 = companies1.map(c => c.business_object);
  const objects2 = companies2.map(c => c.business_object);
  const commonObjects = objects1.filter(o => objects2.includes(o));
  if (commonObjects.length > 0) {
    score += 100 * 0.1;
  }

  // 7. Client type (B2B/B2C/B2G) (5%)
  const types1 = companies1.flatMap(c => c.business_types);
  const types2 = companies2.flatMap(c => c.business_types);
  const commonTypes = types1.filter(t => types2.includes(t));
  if (commonTypes.length > 0) {
    score += 100 * 0.05;
  }

  return score;
};

const getTopMatches = async (userId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return [];

  const currentCompanies = await Company.find({ owner: userId });

  // Get all other activated users
  const otherUsers = await User.find({ 
    _id: { $ne: userId },
    is_activated: true,
    status: 'active'
  });

  const matches = await Promise.all(otherUsers.map(async (user) => {
    const otherCompanies = await Company.find({ owner: user._id });
    const score = calculateMatchingScore(currentUser, user, currentCompanies, otherCompanies);
    return {
      user,
      score,
      companies: otherCompanies
    };
  }));

  // Sort by score descending and take top 10
  return matches.sort((a, b) => b.score - a.score).slice(0, 10);
};

export const MatchingService = {
  getTopMatches,
};

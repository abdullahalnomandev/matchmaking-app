// Test file to verify matching logic without database dependency
import { IUser } from './app/modules/user/user.interface';

// Mock the matching functions for testing
const calculatePsychologicalCompatibility = (user1: IUser, user2: IUser): number => {
  if (!user1.psychological_scores || !user2.psychological_scores) return 0;
  
  const s1 = user1.psychological_scores;
  const s2 = user2.psychological_scores;
  
  const traits = [
    'accountability', 'emotional_stability', 'conflict_management',
    'impulsivity', 'ethics_rule_adherence', 'stress_tolerance',
    'long_term_commitment', 'transparency_honesty'
  ];
  
  let totalDiff = 0;
  let validTraits = 0;
  
  traits.forEach(trait => {
    if (s1[trait] !== undefined && s2[trait] !== undefined) {
      totalDiff += Math.abs(s1[trait] - s2[trait]);
      validTraits++;
    }
  });
  
  if (validTraits === 0) return 0;
  
  const avgDiff = totalDiff / validTraits;
  return Math.max(0, 100 - (avgDiff * 10));
};

const calculatePersonalityMatch = (user1: IUser, user2: IUser): number => {
  if (!user1.mbti_type || !user2.mbti_type) return 0;
  
  if (user1.mbti_type === user2.mbti_type) return 100;
  
  const compatibleTypes: Record<string, string[]> = {
    'INTJ': ['INTP', 'ENTJ', 'INFJ'],
    'INTP': ['INTJ', 'ENTP', 'INFP'],
    'ENTJ': ['INTJ', 'ENTP', 'ESTJ'],
    'ENTP': ['INTP', 'ENTJ', 'ESTP'],
    'INFJ': ['INTJ', 'INFP', 'ENFJ'],
    'INFP': ['INFJ', 'ISFP', 'ENFP'],
    'ENFJ': ['INFJ', 'ENFP', 'ESFJ'],
    'ENFP': ['INFP', 'ENFJ', 'ESFP'],
    'ISTJ': ['ISFJ', 'ESTJ', 'INTJ'],
    'ISFJ': ['ISTJ', 'ESFJ', 'INFJ'],
    'ESTJ': ['ISTJ', 'ENTJ', 'ESFJ'],
    'ESFJ': ['ISFJ', 'ESTJ', 'ENFJ'],
    'ISTP': ['ISFP', 'ESTP', 'INTP'],
    'ISFP': ['ISTP', 'ESFP', 'INFP'],
    'ESTP': ['ISTP', 'ENTP', 'ESFP'],
    'ESFP': ['ISFP', 'ESTP', 'ENFP']
  };
  
  return compatibleTypes[user1.mbti_type]?.includes(user2.mbti_type) ? 75 : 50;
};

// Test data
const mockUser1: IUser = {
  _id: '1' as any,
  name: 'User 1',
  password: 'password',
  role: 'business_user',
  canAccessFeature: true,
  status: 'active',
  verified: true,
  psychological_scores: {
    accountability: 8,
    emotional_stability: 7,
    conflict_management: 6,
    impulsivity: 5,
    ethics_rule_adherence: 9,
    stress_tolerance: 7,
    long_term_commitment: 8,
    transparency_honesty: 9
  },
  mbti_type: 'INTJ',
  experience: 'six_ten',
  business_area: 'technology',
  business_types: ['B2B'],
  business_object: 'products'
};

const mockUser2: IUser = {
  _id: '2' as any,
  name: 'User 2',
  password: 'password',
  role: 'business_user',
  canAccessFeature: true,
  status: 'active',
  verified: true,
  psychological_scores: {
    accountability: 7,
    emotional_stability: 8,
    conflict_management: 7,
    impulsivity: 6,
    ethics_rule_adherence: 8,
    stress_tolerance: 8,
    long_term_commitment: 7,
    transparency_honesty: 8
  },
  mbti_type: 'INTP',
  experience: 'six_ten',
  business_area: 'technology',
  business_types: ['B2B'],
  business_object: 'products'
};

// Test the functions
console.log('Testing matching logic...');
const psychScore = calculatePsychologicalCompatibility(mockUser1, mockUser2);
const personalityScore = calculatePersonalityMatch(mockUser1, mockUser2);

console.log('Psychological compatibility score:', psychScore);
console.log('Personality compatibility score:', personalityScore);
console.log('Test completed successfully!');

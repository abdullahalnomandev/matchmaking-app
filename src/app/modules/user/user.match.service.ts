import { User } from './user.model';
import { getMatchWeightForExperience, getMatchWeightForTurnover } from './user.match.util';
import { userRank } from './user.util';

interface MatchResult {
  user: any;
  matchPercentage: number;
  compatibilityBreakdown: {
    psychological: number;
    personality: number;
    experience: number;
    ca: number;
    businessArea: number;
    businessObject: number;
    businessType: number;
  };
}

// Calculate psychological compatibility (30% weight)
const calculatePsychologicalMatch = (user1: any, user2: any): number => {
  if (!user1.psychological_scores || !user2.psychological_scores) return 0;
  
  const traits = [
    'accountability', 'emotional_stability', 'conflict_management',
    'impulsivity', 'ethics_rule_adherence', 'stress_tolerance',
    'long_term_commitment', 'transparency_honesty'
  ];
  
  let totalDiff = 0;
  let validTraits = 0;
  
  traits.forEach(trait => {
    if (user1.psychological_scores[trait] !== undefined && 
        user2.psychological_scores[trait] !== undefined) {
      totalDiff += Math.abs(user1.psychological_scores[trait] - user2.psychological_scores[trait]);
      validTraits++;
    }
  });
  
  if (validTraits === 0) return 0;
  
  const avgDiff = totalDiff / validTraits;
  return Math.max(0, 100 - (avgDiff * 10));
};

// Calculate personality compatibility using MBTI (20% weight)
const calculatePersonalityMatch = (user1: any, user2: any): number => {
  if (!user1.mbti_type || !user2.mbti_type) return 0;
  
  if (user1.mbti_type === user2.mbti_type) return 100;
  
  // MBTI compatibility matrix
  const compatibleTypes: Record<string, string[]> = {
    'INTJ': ['INTP', 'ENTJ', 'INFJ', 'ENTP'],
    'INTP': ['INTJ', 'ENTP', 'INFP', 'ENTJ'],
    'ENTJ': ['INTJ', 'ENTP', 'ESTJ', 'INTP'],
    'ENTP': ['INTP', 'ENTJ', 'ESTP', 'INTJ'],
    'INFJ': ['INTJ', 'INFP', 'ENFJ', 'ISFJ'],
    'INFP': ['INFJ', 'ISFP', 'ENFP', 'ISFJ'],
    'ENFJ': ['INFJ', 'ENFP', 'ESFJ', 'ISFJ'],
    'ENFP': ['INFP', 'ENFJ', 'ESFP', 'ISFP'],
    'ISTJ': ['ISFJ', 'ESTJ', 'INTJ', 'ISTP'],
    'ISFJ': ['ISTJ', 'ESFJ', 'INFJ', 'ISFP'],
    'ESTJ': ['ISTJ', 'ENTJ', 'ESFJ', 'ESTP'],
    'ESFJ': ['ISFJ', 'ESTJ', 'ENFJ', 'ISFP'],
    'ISTP': ['ISFP', 'ESTP', 'INTP', 'ISTJ'],
    'ISFP': ['ISTP', 'ESFP', 'INFP', 'ISFJ'],
    'ESTP': ['ISTP', 'ENTP', 'ESFP', 'ESTJ'],
    'ESFP': ['ISFP', 'ESTP', 'ENFP', 'ESFJ']
  };
  
  return compatibleTypes[user1.mbti_type]?.includes(user2.mbti_type) ? 80 : 50;
};

// Calculate company CA (turnover) proximity (15% weight)
const calculateCAMatch = (user1: any, user2: any): number => {
  if (!user1.annual_turnover || !user2.annual_turnover) return 0;
  
  const ca1 = getMatchWeightForTurnover(user1.annual_turnover);
  const ca2 = getMatchWeightForTurnover(user2.annual_turnover);
  
  const diff = Math.abs(ca1 - ca2);
  const max = Math.max(ca1, ca2);
  
  if (max === 0) return 0;
  
  return Math.max(0, 100 - (diff / max * 100));
};

// Calculate experience match (10% weight)
const calculateExperienceMatch = (user1: any, user2: any): number => {
  if (!user1.experience || !user2.experience) return 0;
  
  const exp1 = getMatchWeightForExperience(user1.experience);
  const exp2 = getMatchWeightForExperience(user2.experience);
  
  const diff = Math.abs(exp1 - exp2);
  const max = Math.max(exp1, exp2);
  
  if (max === 0) return 0;
  
  return Math.max(0, 100 - (diff / max * 100));
};

// Calculate business area match (10% weight)
const calculateBusinessAreaMatch = (user1: any, user2: any): number => {
  if (!user1.business_area || !user2.business_area) return 0;
  
  if (user1.business_area === user2.business_area) return 100;
  
  // Related business areas - Comprehensive industry mapping
  const relatedAreas: Record<string, string[]> = {
    'agriculture': ['agribusiness', 'farming', 'food production', 'crop', 'livestock'],
    'manufacturing': ['industrial', 'production', 'factory', 'assembly', 'processing'],
    'construction': ['real estate', 'building', 'infrastructure', 'architecture', 'engineering'],
    'energy': ['utilities', 'power', 'renewable', 'solar', 'electricity', 'oil', 'gas'],
    'transportation': ['logistics', 'shipping', 'freight', 'delivery', 'supply chain', 'mobility'],
    'wholesale_retail': ['retail', 'wholesale', 'distribution', 'trade', 'commerce'],
    'it_software': ['technology', 'software', 'it services', 'electronics', 'ai', 'data', 'programming'],
    'telecommunications': ['telecom', 'communication', 'networking', 'internet', 'mobile'],
    'media_entertainment': ['media', 'entertainment', 'broadcasting', 'publishing', 'content'],
    'financial_services': ['finance', 'banking', 'investment', 'fintech', 'financial'],
    'insurance': ['risk management', 'assurance', 'coverage', 'underwriting'],
    'healthcare': ['medical', 'health', 'pharmaceuticals', 'wellness', 'life sciences', 'clinical'],
    'pharmaceuticals': ['biotechnology', 'drugs', 'medicine', 'pharma', 'life sciences'],
    'education_training': ['education', 'training', 'consulting', 'research', 'learning', 'e-learning'],
    'legal_services': ['legal', 'law', 'attorney', 'counsel', 'jurisdiction'],
    'accounting_audit': ['accounting', 'audit', 'bookkeeping', 'cfo', 'finance'],
    'consulting_advisory': ['consulting', 'advisory', 'strategy', 'management consulting'],
    'hr_recruitment': ['human resources', 'recruitment', 'staffing', 'hiring', 'personnel'],
    'marketing_advertising': ['marketing', 'advertising', 'pr', 'branding', 'digital marketing'],
    'ecommerce_marketplaces': ['ecommerce', 'marketplaces', 'online selling', 'e-commerce'],
    'tourism_hospitality': ['tourism', 'hospitality', 'travel', 'hotel', 'restaurant'],
    'food_beverage': ['food', 'beverage', 'restaurant', 'catering', 'f&b'],
    'fashion_apparel': ['fashion', 'apparel', 'clothing', 'textiles', 'style'],
    'consumer_goods': ['consumer', 'goods', 'products', 'retail products', 'fmcg'],
    'automotive_mobility': ['automotive', 'car', 'vehicle', 'mobility', 'transport'],
    'aerospace_defense': ['aerospace', 'defense', 'aviation', 'military', 'space'],
    'maritime_shipping': ['maritime', 'shipping', 'sea', 'port', 'marine'],
    'mining_resources': ['mining', 'natural resources', 'extraction', 'minerals', 'resources'],
    'environmental_services': ['environmental', 'sustainability', 'green', 'eco', 'environment'],
    'waste_management': ['waste', 'recycling', 'disposal', 'environmental services'],
    'security_surveillance': ['security', 'surveillance', 'protection', 'safety', 'monitoring'],
    'public_admin_ngo': ['public administration', 'ngo', 'government', 'non-profit', 'civil'],
    'research_development': ['research', 'development', 'r&d', 'innovation', 'labs'],
    'ai_data_analytics': ['ai', 'data', 'analytics', 'machine learning', 'advanced analytics'],
    'web3_blockchain': ['web3', 'blockchain', 'fintech', 'crypto', 'decentralized']
  };
  
  for (const [area, related] of Object.entries(relatedAreas)) {
    if ((user1.business_area.toLowerCase().includes(area) && 
         related.some(r => user2.business_area.toLowerCase().includes(r))) ||
        (user2.business_area.toLowerCase().includes(area) && 
         related.some(r => user1.business_area.toLowerCase().includes(r)))) {
      return 75;
    }
  }
  
  return 25;
};

// Calculate business object match (5% weight)
const calculateBusinessObjectMatch = (user1: any, user2: any): number => {
  if (!user1.business_object || !user2.business_object) return 0;
  
  if (user1.business_object === user2.business_object) return 100;
  
  if (user1.business_object === 'products_and_services' || 
      user2.business_object === 'products_and_services') {
    return 75;
  }
  
  return 50;
};

// Calculate business type match (10% weight)
const calculateBusinessTypeMatch = (user1: any, user2: any): number => {
  if (!user1.business_types || !user2.business_types || 
      user1.business_types.length === 0 || user2.business_types.length === 0) {
    return 0;
  }
  
  const commonTypes = user1.business_types.filter((type: string) => 
    user2.business_types.includes(type)
  );
  
  if (commonTypes.length > 0) return 100;
  
  // Partial compatibility
  const typeCompatibility: Record<string, string[]> = {
    'B2B': ['B2G'],
    'B2C': ['B2B'],
    'B2G': ['B2B']
  };
  
  for (const type1 of user1.business_types) {
    for (const type2 of user2.business_types) {
      if (typeCompatibility[type1]?.includes(type2) || 
          typeCompatibility[type2]?.includes(type1)) {
        return 50;
      }
    }
  }
  
  return 25;
};

// Main matching calculation
const calculateMatchScore = (currentUser: any, otherUser: any): MatchResult => {
  const psychological = calculatePsychologicalMatch(currentUser, otherUser);
  const personality = calculatePersonalityMatch(currentUser, otherUser);
  const ca = calculateCAMatch(currentUser, otherUser);
  const experience = calculateExperienceMatch(currentUser, otherUser);
  const businessArea = calculateBusinessAreaMatch(currentUser, otherUser);
  const businessObject = calculateBusinessObjectMatch(currentUser, otherUser);
  const businessType = calculateBusinessTypeMatch(currentUser, otherUser);
  
  // Final weighted score calculation
  const matchPercentage = Math.round(
    (psychological * 0.30) +      // 30%
    (personality * 0.20) +         // 20%
    (ca * 0.15) +                 // 15%
    (experience * 0.10) +          // 10%
    (businessArea * 0.10) +         // 10%
    (businessObject * 0.05) +       // 5%
    (businessType * 0.10)           // 10%
  );
  
  return {
    user: {
      id: otherUser._id,
      name: otherUser.name,
      country: otherUser.country,
      company_legal_name: otherUser.company_legal_name,
      experience: otherUser.experience,
      business_area: otherUser.business_area,
      business_types: otherUser.business_types,
      business_object: otherUser.business_object,
      annual_turnover: otherUser.annual_turnover,
      mbti_type: otherUser.mbti_type,
      ranking_score: otherUser.ranking_score,
      rank_level: userRank(
        (otherUser.ranking_score?.psychological || 0) +
        (otherUser.ranking_score?.personality || 0) +
        (otherUser.ranking_score?.experience || 0) +
        (otherUser.ranking_score?.turnover || 0) +
        (otherUser.ranking_score?.activity || 0)
      )
    },
    matchPercentage,
    compatibilityBreakdown: {
      psychological,
      personality,
      experience,
      ca,
      businessArea,
      businessObject,
      businessType
    }
  };
};

const getMatchableUsers = async (currentUser: {
  role: string;
  id: string;
} , query?: any): Promise<any> => {
  try {
    // Get current user details
    const userProfile = await User.findById(currentUser.id).lean();
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Build base query with filters
    let userQuery = User.find({
      role: currentUser.role,
      _id: { $ne: currentUser.id }
    });
    
    // Apply search filter for company_legal_name using regex
    if (query?.searchTerm) {
      userQuery = userQuery.where('company_legal_name').regex(
        new RegExp(query.searchTerm, 'i') // Case-insensitive regex search
      );
    }
    
    // Apply filters from query parameters
    if (query?.business_area) {
      userQuery = userQuery.where('business_area').equals(query.business_area);
    }
    
    if (query?.business_types) {
      userQuery = userQuery.where('business_types').in(query.business_types);
    }
    
    if (query?.experience) {
      userQuery = userQuery.where('experience').equals(query.experience);
    }
    
    // Apply rank_level filter if provided
    if (query?.rank_level) {
      const allUsers = await userQuery.lean();
      const filteredUsers = allUsers.filter(user => {
        const rankScore = (user.ranking_score?.psychological || 0) +
                          (user.ranking_score?.personality || 0) +
                          (user.ranking_score?.experience || 0) +
                          (user.ranking_score?.turnover || 0) +
                          (user.ranking_score?.activity || 0);
        const calculatedRank = userRank(rankScore);
        return calculatedRank === query.rank_level;
      });
      
      // Calculate matches for filtered users
      const matchResults = filteredUsers.map(user => 
        calculateMatchScore(userProfile, user)
      );
      
      // Sort by highest percentage first
      const sortedResults = matchResults
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
      
      // Apply pagination after sorting
      const page = parseInt(query?.page) || 1;
      const limit = parseInt(query?.limit) || 10;
      const skip = (page - 1) * limit;
      
      const paginatedResults = sortedResults.slice(skip, skip + limit);
      
      return {
        data: paginatedResults,
        meta: {
          total: sortedResults.length,
          page,
          limit,
          totalPage: Math.ceil(sortedResults.length / limit)
        }
      };
    }
    
    // Get all potential matches (no pagination yet)
    const potentialMatches = await userQuery.lean();
    
    console.log(`Found ${potentialMatches.length} potential matches for user ${currentUser.id}`);
    console.log('Current user role:', currentUser.role);
    console.log('Current user ID:', currentUser.id);
    
    // Calculate match scores for all potential matches
    const matchResults = potentialMatches.map(user => 
      calculateMatchScore(userProfile, user)
    );
    
    // Sort by highest percentage first (95% first, then 80%, etc.) - BEFORE pagination
    const sortedResults = matchResults
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
      
    console.log(`Returning ${sortedResults.length} matches sorted by score`);
    
    // Apply pagination AFTER sorting
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;
    
    const paginatedResults = sortedResults.slice(skip, skip + limit);
    
    return {
      data: paginatedResults,
      meta: {
        total: sortedResults.length,
        page,
        limit,
        totalPage: Math.ceil(sortedResults.length / limit)
      }
    };
  } catch (error) {
    console.error('Error in getMatchableUsers:', error);
    throw error;
  }
};



const getMatchCount = async (currentUser: {
  role: string;
  id: string;
}): Promise<any> => {
  try {
    // Get current user details
    const userProfile = await User.findById(currentUser.id).lean();
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Get all other users with same role
    const potentialMatches = await User.find({
      role: currentUser.role,
      _id: { $ne: currentUser.id }
    }).lean();
    
    // Calculate match scores for all potential matches
    const matchResults = potentialMatches.map(user => 
      calculateMatchScore(userProfile, user)
    );
    
    // Count eligible matches (>=70%)
    const eligibleMatches = matchResults.filter(match => match.matchPercentage >= 70);
    
    // Count average matches (<70%)
    const averageMatches = matchResults.filter(match => match.matchPercentage < 70);
    
    return {
      eligibleMatchesCount: eligibleMatches.length,
      averageMatchCount: averageMatches.length,
      totalMatches: matchResults.length
    };
  } catch (error) {
    console.error('Error in getMatchCount:', error);
    throw error;
  }
};

export const UserMatchService = {
  getMatchableUsers,
  getMatchCount
};

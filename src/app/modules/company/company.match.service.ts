import { Company } from './company.model';
import { User } from '../user/user.model';
import { getMatchWeightForExperience, getMatchWeightForTurnover } from '../user/user.match.util';
import { userRank } from '../user/user.util';

interface MatchResult {
  company: any;
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
const calculatePsychologicalMatch = (currentUser: any, company: any): number => {
  const user1Scores = currentUser.psychological_scores;
  const user2Scores = (company.owner as any)?.psychological_scores;
  
  // If either user doesn't have psychological scores, return neutral score (50%)
  if (!user1Scores || !user2Scores) return 50;
  
  const traits = [
    'accountability', 'emotional_stability', 'conflict_management',
    'impulsivity', 'ethics_rule_adherence', 'stress_tolerance',
    'long_term_commitment', 'transparency_honesty'
  ];
  
  let totalDiff = 0;
  let validTraits = 0;
  
  traits.forEach(trait => {
    if (user1Scores[trait] !== undefined && 
        user2Scores[trait] !== undefined) {
      totalDiff += Math.abs(user1Scores[trait] - user2Scores[trait]);
      validTraits++;
    }
  });
  
  if (validTraits === 0) return 50; // Return neutral if no valid traits
  
  const avgDiff = totalDiff / validTraits;
  return Math.max(0, 100 - (avgDiff * 10));
};

// Calculate personality compatibility using MBTI (20% weight)
const calculatePersonalityMatch = (currentUser: any, company: any): number => {
  const user1Mbti = currentUser.mbti_type;
  const user2Mbti = (company.owner as any)?.mbti_type;
  
  // If either user doesn't have MBTI type, return neutral score (50%)
  if (!user1Mbti || !user2Mbti) return 50;
  
  if (user1Mbti === user2Mbti) return 100;
  
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
  
  return compatibleTypes[user1Mbti]?.includes(user2Mbti) ? 80 : 50;
};

// Calculate company CA (turnover) proximity (15% weight)
const calculateCAMatch = (currentUser: any, company: any): number => {
  const user1Turnover = currentUser.annual_turnover;
  const user2Turnover = company.annual_turnover;
  
  // If either user doesn't have turnover data, return neutral score (50%)
  if (!user1Turnover || !user2Turnover) return 50;
  
  const ca1 = getMatchWeightForTurnover(user1Turnover);
  const ca2 = getMatchWeightForTurnover(user2Turnover);
  
  const diff = Math.abs(ca1 - ca2);
  const max = Math.max(ca1, ca2);
  
  if (max === 0) return 50;
  
  return Math.max(0, 100 - (diff / max * 100));
};

// Calculate experience match (10% weight)
const calculateExperienceMatch = (currentUser: any, company: any): number => {
  const user1Experience = currentUser.experience;
  const user2Experience = company.experience;
  
  // If either user doesn't have experience data, return neutral score (50%)
  if (!user1Experience || !user2Experience) return 50;
  
  const exp1 = getMatchWeightForExperience(user1Experience);
  const exp2 = getMatchWeightForExperience(user2Experience);
  
  const diff = Math.abs(exp1 - exp2);
  const max = Math.max(exp1, exp2);
  
  if (max === 0) return 50;
  
  return Math.max(0, 100 - (diff / max * 100));
};

// Calculate business area match (10% weight)
const calculateBusinessAreaMatch = (currentUser: any, company: any): number => {
  const user1Area = currentUser.business_area;
  const user2Area = company.business_area;
  
  // If either user doesn't have business area data, return neutral score (50%)
  if (!user1Area || !user2Area) return 50;
  
  if (user1Area === user2Area) return 100;
  
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
    if ((user1Area.toLowerCase().includes(area) && 
         related.some(r => user2Area.toLowerCase().includes(r))) ||
        (user2Area.toLowerCase().includes(area) && 
         related.some(r => user1Area.toLowerCase().includes(r)))) {
      return 75;
    }
  }
  
  return 25;
};

// Calculate business object match (5% weight)
const calculateBusinessObjectMatch = (currentUser: any, company: any): number => {
  const user1Object = currentUser.business_object;
  const user2Object = company.business_object;
  
  // If either user doesn't have business object data, return neutral score (50%)
  if (!user1Object || !user2Object) return 50;
  
  if (user1Object === user2Object) return 100;
  
  if (user1Object === 'products_and_services' || 
      user2Object === 'products_and_services') {
    return 75;
  }
  
  return 50;
};

// Calculate business type match (10% weight)
const calculateBusinessTypeMatch = (currentUser: any, company: any): number => {
  const user1Types = currentUser.business_types;
  const user2Types = company.business_types;
  
  // If either user doesn't have business types data, return neutral score (50%)
  if (!user1Types || !user2Types || 
      user1Types.length === 0 || user2Types.length === 0) {
    return 50;
  }
  
  const commonTypes = user1Types.filter((type: string) => 
    user2Types.includes(type)
  );
  
  if (commonTypes.length > 0) return 100;
  
  // Partial compatibility
  const typeCompatibility: Record<string, string[]> = {
    'B2B': ['B2G'],
    'B2C': ['B2B'],
    'B2G': ['B2B']
  };
  
  for (const type1 of user1Types) {
    for (const type2 of user2Types) {
      if (typeCompatibility[type1]?.includes(type2) || 
          typeCompatibility[type2]?.includes(type1)) {
        return 50;
      }
    }
  }
  
  return 25;
};

// Main matching calculation
const calculateMatchScore = (currentUser: any, company: any): MatchResult => {
  const psychological = calculatePsychologicalMatch(currentUser, company);
  const personality = calculatePersonalityMatch(currentUser, company);
  const ca = calculateCAMatch(currentUser, company);
  const experience = calculateExperienceMatch(currentUser, company);
  const businessArea = calculateBusinessAreaMatch(currentUser, company);
  const businessObject = calculateBusinessObjectMatch(currentUser, company);
  const businessType = calculateBusinessTypeMatch(currentUser, company);
  
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
    company: {
      id: company._id,
      company_name: company.company_name,
      company_legal_name: company.company_legal_name,
      company_location: company.company_location,
      company_website: company.company_website,
      country: company.country,
      experience: company.experience,
      business_area: company.business_area,
      business_types: company.business_types,
      business_object: company.business_object,
      annual_turnover: company.annual_turnover,
      owner: {
        id: (company.owner as any)?._id,
        name: (company.owner as any)?.name,
        image: (company.owner as any)?.image,
        email: (company.owner as any)?.email,
        mbti_type: (company.owner as any)?.mbti_type,
        // ranking_score: (company.owner as any)?.ranking_score,
        rank_level: userRank(
          ((company.owner as any)?.ranking_score?.psychological || 0) +
          ((company.owner as any)?.ranking_score?.personality || 0) +
          ((company.owner as any)?.ranking_score?.experience || 0) +
          ((company.owner as any)?.ranking_score?.turnover || 0) +
          ((company.owner as any)?.ranking_score?.activity || 0)
        )
      }
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

const getMatchableCompanies = async (currentUser: {
  role: string;
  id: string;
} , query?: any): Promise<any> => {
  try {
    // Get current user details
    const userProfile = await User.findById(currentUser.id).lean();
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Get current user's company data to use for matching
    const userCompany = await Company.findOne({ owner: currentUser.id }).lean();
    
    
    // Merge user profile with company data for matching
    const currentUserForMatching = {
      ...userProfile,
      ...userCompany,
      // Ensure we have the company data for matching
      experience: userCompany?.experience || userProfile.experience,
      annual_turnover: userCompany?.annual_turnover || userProfile.annual_turnover,
      business_area: userCompany?.business_area || userProfile.business_area,
      business_types: userCompany?.business_types || userProfile.business_types,
      business_object: userCompany?.business_object || userProfile.business_object
    };
    
    // Debug current user data
    console.log('Current user for matching:', {
      id: currentUserForMatching._id,
      name: currentUserForMatching.name,
      experience: currentUserForMatching.experience,
      annual_turnover: currentUserForMatching.annual_turnover,
      business_area: currentUserForMatching.business_area,
      psychological_scores: !!currentUserForMatching.psychological_scores,
      mbti_type: currentUserForMatching.mbti_type
    });
    
    // Build base query with filters for companies
    let companyQuery = Company.find({
      owner: { $ne: currentUser.id },
    }).populate('owner', 'name email image psychological_scores personality_scores mbti_type ranking_score verified');
    
    // Apply search filter for company_name using regex
    if (query?.searchTerm) {
      companyQuery = companyQuery.where('company_name').regex(
        new RegExp(query.searchTerm, 'i') // Case-insensitive regex search
      );
    }
    
    // Apply filters from query parameters
    if (query?.business_area) {
      companyQuery = companyQuery.where('business_area').equals(query.business_area);
    }
    
    if (query?.business_types) {
      companyQuery = companyQuery.where('business_types').in(query.business_types);
    }
    
    if (query?.experience) {
      companyQuery = companyQuery.where('experience').equals(query.experience);
    }
    
    // Filter for verified users only - TEMPORARILY COMMENTED OUT FOR DEBUGGING
    // companyQuery = companyQuery.where('owner.verified').equals(true);
    
    // Debug: Check if verified filter is working
    console.log('TEMPORARILY DISABLED verified filter for debugging');
    
    // Apply rank_level filter if provided
    if (query?.rank_level) {
      const allCompanies = await companyQuery.lean();
      const filteredCompanies = allCompanies.filter(company => {
        const ownerData = company.owner as any;
        const rankScore = (ownerData?.ranking_score?.psychological || 0) +
                          (ownerData?.ranking_score?.personality || 0) +
                          (ownerData?.ranking_score?.experience || 0) +
                          (ownerData?.ranking_score?.turnover || 0) +
                          (ownerData?.ranking_score?.activity || 0);
        const calculatedRank = userRank(rankScore);
        return calculatedRank === query.rank_level;
      });
      
      // Calculate matches for filtered companies
      const matchResults = filteredCompanies.map(company => 
        calculateMatchScore(currentUserForMatching, company)
      );
      
      // Filter by match percentage if specified
      let filteredByMatchResults = matchResults;
      if (query?.minMatchPercentage) {
        const minPercentage = parseInt(query.minMatchPercentage);
        filteredByMatchResults = matchResults.filter(match => 
          match.matchPercentage >= minPercentage
        );
      }
      
      // Sort by highest percentage first
      const sortedResults = filteredByMatchResults
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
    const potentialMatches = await companyQuery.lean();
    
    // Debug: Log each potential match
    potentialMatches.forEach((company, index) => {
      console.log(`Potential match ${index + 1}:`, {
        companyId: company._id,
        companyName: company.company_name,
        ownerId: company.owner?._id,
        ownerVerified: (company.owner as any)?.verified,
        ownerName: (company.owner as any)?.name
      });
    });
    
    // Calculate match scores for all potential matches
    const matchResults = potentialMatches.map(company => 
      calculateMatchScore(currentUserForMatching, company)
    );
    
    // Filter by match percentage if specified
    let filteredByMatchResults = matchResults;
    if (query?.minMatchPercentage) {
      const minPercentage = parseInt(query.minMatchPercentage);
      filteredByMatchResults = matchResults.filter(match => 
        match.matchPercentage >= minPercentage
      );
    }
    
    // Sort by highest percentage first (95% first, then 80%, etc.) - BEFORE pagination
    const sortedResults = filteredByMatchResults
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
      
    console.log(`Returning ${sortedResults.length} company matches sorted by score`);
    
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
    console.error('Error in getMatchableCompanies:', error);
    throw error;
  }
};



const getMatchCountCompanies = async (currentUser: {
  role: string;
  id: string;
}): Promise<any> => {
  try {
    // Get current user details
    const userProfile = await User.findById(currentUser.id).lean();
    if (!userProfile) {
      throw new Error('User not found');
    }
    
    // Get current user's company data to use for matching
    const userCompany = await Company.findOne({ owner: currentUser.id }).lean();
    
    // Merge user profile with company data for matching
    const currentUserForMatching = {
      ...userProfile,
      ...userCompany,
      // Ensure we have the company data for matching
      experience: userCompany?.experience || userProfile.experience,
      annual_turnover: userCompany?.annual_turnover || userProfile.annual_turnover,
      business_area: userCompany?.business_area || userProfile.business_area,
      business_types: userCompany?.business_types || userProfile.business_types,
      business_object: userCompany?.business_object || userProfile.business_object
    };
    
    // Get all other companies (excluding current user's companies) - verified users only
    const potentialMatches = await Company.find({
      owner: { $ne: currentUser.id }
    }).populate('owner', 'name email image psychological_scores personality_scores mbti_type ranking_score verified').lean();
    
    // Filter for verified users only - TEMPORARILY COMMENTED OUT FOR DEBUGGING
    // const verifiedMatches = potentialMatches.filter(company => 
    //   (company.owner as any)?.verified === true
    // );
    const verifiedMatches = potentialMatches; // Use all matches for debugging
    
    // Calculate match scores for verified companies only
    const matchResults = verifiedMatches.map(company => 
      calculateMatchScore(currentUserForMatching, company)
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
    console.error('Error in getMatchCountCompanies:', error);
    throw error;
  }
};

export const CompanyMatchService = {
  getMatchableCompanies,
  getMatchCountCompanies
};

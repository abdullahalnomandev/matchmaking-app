import { Company } from './company.model';
import { ICompany, ICompanyFilters } from './company.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import {
  getWeightForExperience,
  getWeightForTurnover,
} from '../user/user.util';
import { BUSINESS_EXPERIENCE } from '../../../enums/business';

// Helper function to calculate and update user ranking scores
const updateUserRankingScores = async (ownerId: string): Promise<void> => {
  const companies = await Company.find(
    { owner: ownerId },
    { experience: 1, annual_turnover: 1 },
  ).lean();

  if (companies.length === 0) {
    // Reset scores to 0 if no companies exist
    await User.updateOne(
      { _id: ownerId },
      { $set: { 'ranking_score.experience': 0, 'ranking_score.turnover': 0 } },
    );
    return;
  }

  const result = companies.reduce(
    (acc, company) => {
      acc.exp += getWeightForExperience(
        company.experience as BUSINESS_EXPERIENCE,
      );
      acc.turn += getWeightForTurnover(company.annual_turnover as string);
      return acc;
    },
    { exp: 0, turn: 0 },
  );

  const user = await User.findById(ownerId).lean();

  const ranking_score = {
    ...user?.ranking_score,
    experience: Math.round((result.exp / companies.length) * 100) / 100,
    turnover: Math.round((result.turn / companies.length) * 100) / 100,
  };

  await User.updateOne({ _id: ownerId }, { $set: { ranking_score } });
};

const createCompanyToDB = async (
  payload: Partial<ICompany>,
): Promise<ICompany> => {
  if (!payload.owner) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Owner ID is required');
  }

  const companies = await Company.find(
    { owner: payload.owner },
    { experience: 1, annual_turnover: 1 },
  ).lean();

  const all = [...companies, payload];

  const result = all.reduce(
    (acc, company) => {
      acc.exp += getWeightForExperience(
        company.experience as BUSINESS_EXPERIENCE,
      );
      acc.turn += getWeightForTurnover(company.annual_turnover as string);
      return acc;
    },
    { exp: 0, turn: 0 },
  );

  const count = all.length;

  const user = await User.findById(payload.owner).lean();

  const ranking_score = {
    ...user?.ranking_score,
    experience: Math.round((result.exp / count) * 100) / 100,
    turnover: Math.round((result.turn / count) * 100) / 100,
  };

  const company = await Company.create(payload);

  await User.updateOne({ _id: payload.owner }, { $set: { ranking_score } });

  return company;
};

// const experienceWeight = getWeightForExperience(
//   payload.experience as BUSINESS_EXPERIENCE,
// );
// const turnoverWeight = getWeightForTurnover(
//   payload.annual_turnover as string,
// );
// payload.ranking_score.experience = experienceWeight;
// payload.ranking_score.turnover = turnoverWeight;

const getAllCompaniesFromDB = async (
  user: any,
  query: Record<string, unknown>
): Promise<{ data: ICompany[]; meta: any }> => {
  const queryBuilder = new QueryBuilder(
    Company.find(),
    query as Record<string, unknown>,
  )
    .search(['company_name', 'company_legal_name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('owner', 'image name email');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getCompanyByIdFromDB = async (id: string): Promise<ICompany | null> => {
  const company = await Company.findById(id).populate(
    'owner',
    'name email business_area',
  );
  return company;
};

const getCompanyByOwnerFromDB = async (
  ownerId: string,
): Promise<ICompany | null> => {
  const company = await Company.findOne({ owner: ownerId }).populate(
    'owner',
    'name email business_area',
  );
  return company;
};

const updateCompanyToDB = async (
  id: string,
  payload: Partial<ICompany>,
): Promise<ICompany | null> => {
  const company = await Company.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
  }

  // Update user ranking scores after company update
  await updateUserRankingScores(company.owner.toString());

  return company;
};

const deleteCompanyFromDB = async (id: string): Promise<void> => {
  try {
    // Find the company first to get owner info before deletion
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
    }

    // Delete the company
    await Company.findByIdAndDelete(id);

    // Update user ranking scores after company deletion
    await updateUserRankingScores(company.owner.toString());
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete company');
  }
};

const toggleCompanyVerification = async (
  id: string,
): Promise<ICompany | null> => {
  try {
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
    }

    await company.save();

    return company;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to toggle company verification status',
    );
  }
};

const toggleCompanyStatus = async (id: string): Promise<ICompany | null> => {
  try {
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
    }

    await company.save();

    return company;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to toggle company status',
    );
  }
};

const getCompaniesByBusinessArea = async (
  businessArea: string,
  filters: ICompanyFilters,
): Promise<{ data: ICompany[]; meta: any }> => {
  const queryFilters = {
    ...filters,
    business_area: businessArea,
    isActive: true,
  };

  const queryBuilder = new QueryBuilder(
    Company.find(),
    queryFilters as Record<string, unknown>,
  )
    .search(['company_name', 'company_legal_name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('owner', 'name email');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getVerifiedCompanies = async (
  filters: ICompanyFilters,
): Promise<{ data: ICompany[]; meta: any }> => {
  const queryFilters = {
    ...filters,
    isVerified: true,
    isActive: true,
  };

  const queryBuilder = new QueryBuilder(
    Company.find(),
    queryFilters as Record<string, unknown>,
  )
    .search(['company_name', 'company_legal_name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('owner', 'name email');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getCompaniesByCountry = async (
  country: string,
  filters: ICompanyFilters,
): Promise<{ data: ICompany[]; meta: any }> => {
  const queryFilters = {
    ...filters,
    country: country,
    isActive: true,
  };

  const queryBuilder = new QueryBuilder(
    Company.find(),
    queryFilters as Record<string, unknown>,
  )
    .search(['company_name', 'company_legal_name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('owner', 'name email');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getMyCompanies = async (
  userId: string,
):  Promise<{ data: ICompany[]; meta: any }> => {
  const companiesQueryBuilder = new QueryBuilder(
    Company.find({ owner: userId }),
    {} as Record<string, unknown>,
  )
    .search(['company_name', 'company_legal_name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await companiesQueryBuilder.modelQuery.populate(
    'owner',
    'name email',
  );
  const pagination = await companiesQueryBuilder.getPaginationInfo();

  return {
    data: result,
    meta: pagination,
  };
};

export const CompanyService = {
  createCompanyToDB,
  getAllCompaniesFromDB,
  getCompanyByIdFromDB,
  getCompanyByOwnerFromDB,
  updateCompanyToDB,
  deleteCompanyFromDB,
  toggleCompanyVerification,
  toggleCompanyStatus,
  getCompaniesByBusinessArea,
  getVerifiedCompanies,
  getCompaniesByCountry,
  getMyCompanies,
};

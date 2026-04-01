import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICompany } from './company.interface';
import { Company } from './company.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserService } from '../user/user.service';

const createCompany = async (payload: ICompany): Promise<ICompany> => {
  const result = await Company.create(payload);
  await UserService.updateRankingScore(payload.owner.toString());
  return result;
};

const getAllCompanies = async (query: Record<string, unknown>) => {
  const companyQuery = new QueryBuilder(Company.find().populate('owner'), query)
    .search(['legal_name', 'vat_number', 'company_id_number'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await companyQuery.modelQuery;
  const meta = await companyQuery.modelQuery.countDocuments();

  return {
    meta,
    result,
  };
};

const getSingleCompany = async (id: string): Promise<ICompany | null> => {
  return await Company.findById(id).populate('owner');
};

const updateCompany = async (id: string, payload: Partial<ICompany>): Promise<ICompany | null> => {
  const isExist = await Company.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
  }

  const result = await Company.findByIdAndUpdate(id, payload, { new: true });
  if (result) {
    await UserService.updateRankingScore(result.owner.toString());
  }
  return result;
};

const deleteCompany = async (id: string): Promise<ICompany | null> => {
  const isExist = await Company.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Company not found');
  }

  return await Company.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
};

export const CompanyService = {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
};

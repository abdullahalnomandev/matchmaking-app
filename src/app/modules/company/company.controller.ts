import { Request, Response } from 'express';
import { CompanyService } from './company.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { CompanyMatchService } from './company.match.service';

const createCompany = catchAsync(async (req: Request, res: Response) => {
  // Add owner from authenticated user
  const payload = {
    ...req.body,
    owner: (req.user as any).id
  };

  const result = await CompanyService.createCompanyToDB(payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Company created successfully',
    data: result,
  });
});

const getAllCompanies = catchAsync(async (req: Request, res: Response) => {

   const user = req.user as any;
  const result = await CompanyMatchService.getMatchableCompanies(user, req.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Companies retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getCompanyById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CompanyService.getCompanyByIdFromDB(id);
  
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Company not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company retrieved successfully',
    data: result,
  });
});

const getMyCompany = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)._id;
  const result = await CompanyService.getCompanyByOwnerFromDB(userId);
  
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Company not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company retrieved successfully',
    data: result,
  });
});

const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = {
    ...req.body,
    updatedBy: (req.user as any)._id
  };
  
  const result = await CompanyService.updateCompanyToDB(id, payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company updated successfully',
    data: result,
  });
});

const deleteCompany = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CompanyService.deleteCompanyFromDB(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company deleted successfully',
    data: null,
  });
});

const toggleVerificationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const result = await CompanyService.toggleCompanyVerification(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company verification status toggled successfully',
    data: result,
  });
});

const toggleCompanyStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const result = await CompanyService.toggleCompanyStatus(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company status toggled successfully',
    data: result,
  });
});

const getCompaniesByBusinessArea = catchAsync(async (req: Request, res: Response) => {
  const { businessArea } = req.params;
  
  const filters = {
    search: req.query.search as string,
    experience: req.query.experience as any,
    positions: req.query.positions as any,
    annual_turnover: req.query.annual_turnover as string,
    country: req.query.country as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10
  };
  
  const result = await CompanyService.getCompaniesByBusinessArea(businessArea, filters);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Companies retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getVerifiedCompanies = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    business_object: req.query.business_object as any,
    business_types: req.query.business_types as any,
    business_area: req.query.business_area as string,
    experience: req.query.experience as any,
    positions: req.query.positions as any,
    annual_turnover: req.query.annual_turnover as string,
    country: req.query.country as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10
  };
  
  const result = await CompanyService.getVerifiedCompanies(filters);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Verified companies retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getCompaniesByCountry = catchAsync(async (req: Request, res: Response) => {
  const { country } = req.params;
  
  const filters = {
    search: req.query.search as string,
    business_object: req.query.business_object as any,
    business_types: req.query.business_types as any,
    business_area: req.query.business_area as string,
    experience: req.query.experience as any,
    positions: req.query.positions as any,
    annual_turnover: req.query.annual_turnover as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10
  };
  
  const result = await CompanyService.getCompaniesByCountry(country, filters);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Companies retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getMyCompanies = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  const result = await CompanyService.getMyCompanies(userId);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My companies retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getCompanyCount = catchAsync(async (req: Request, res: Response) => {
  const count = await CompanyMatchService.getMatchCountCompanies({
    role: req.user?.role!,
    id: req.user?.id!
  });
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Company count retrieved successfully',
    data: { count },
  });
});

export const CompanyController = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  deleteCompany,
  toggleVerificationStatus,
  toggleCompanyStatus,
  getCompaniesByBusinessArea,
  getVerifiedCompanies,
  getCompaniesByCountry,
  getMyCompanies,
  getCompanyCount
};

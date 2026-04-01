import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CompanyService } from './company.service';

const createCompany = catchAsync(async (req: Request, res: Response) => {
  const { ...companyData } = req.body;
  const owner = req.user._id;
  const result = await CompanyService.createCompany({ ...companyData, owner });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Company created successfully',
    data: result,
  });
});

const getAllCompanies = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getAllCompanies(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Companies fetched successfully',
    data: result.result,
  });
});

const getSingleCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.getSingleCompany(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company fetched successfully',
    data: result,
  });
});

const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.updateCompany(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company updated successfully',
    data: result,
  });
});

const deleteCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await CompanyService.deleteCompany(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company deleted successfully',
    data: result,
  });
});

export const CompanyController = {
  createCompany,
  getAllCompanies,
  getSingleCompany,
  updateCompany,
  deleteCompany,
};

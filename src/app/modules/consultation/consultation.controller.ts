import { Request, Response } from 'express';
import { ConsultationService } from './consultation.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const createConsultation = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const payload = req.body;

  const result = await ConsultationService.createConsultation(payload, user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Consultation created successfully',
    data: result,
  });
});

const getConsultations = catchAsync(async (req: Request, res: Response) => {
  const result = await ConsultationService.getConsultations(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultations retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const getConsultationById = catchAsync(async (req: Request, res: Response) => {
  const { consultationId } = req.params;
  const result = await ConsultationService.getConsultationById(
    consultationId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultation retrieved successfully',
    data: result,
  });
});

const getConsultationsByCompany = catchAsync(
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const result = await ConsultationService.getConsultationsByCompany(
      req.query,
      companyId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Company consultations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getConsultationsByCreator = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await ConsultationService.getConsultationsByCreator(
      req.query,
      user.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Your consultations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const updateConsultation = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { consultationId } = req.params;
  const payload = req.body;

  const result = await ConsultationService.updateConsultation(
    consultationId as string,
    user.id,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultation updated successfully',
    data: result,
  });
});

const deleteConsultation = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { consultationId } = req.params;

  const result = await ConsultationService.deleteConsultation(
    consultationId as string,
    user.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Consultation deleted successfully',
    data: result,
  });
});

const getUserConsultations = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ConsultationService.getUserBetterCallMe(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your consultations retrieved successfully',
    data: result.data,
    // pagination: result.pagination,
  });
});

const getMyBookedConsultations = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await ConsultationService.getBookingConsultations(
      req.query,
      user.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Your booked consultations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  },
);

export const ConsultationController = {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByCompany,
  getConsultationsByCreator,
  updateConsultation,
  deleteConsultation,
  getUserConsultations,
  getMyBookedConsultations,
};

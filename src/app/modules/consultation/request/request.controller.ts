import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ConsultationRequestService } from './request.service';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../shared/catchAsync';

// =========================
// Create Consultation Request
// =========================
const createConsultationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;
    const payload = req.body;

    const result =
      await ConsultationRequestService.createConsultationRequest(
        payload,
        user.id
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Consultation request created successfully',
      data: result,
    });
  }
);

// =========================
// Get All Consultation Requests
// =========================
const getConsultationRequests = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ConsultationRequestService.getConsultationRequests(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Consultation requests retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// =========================
// Get Requests by User
// =========================
const getConsultationRequestsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result =
      await ConsultationRequestService.getConsultationRequestsByUser(
        req.query,
        user.id
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Your consultation requests retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// =========================
// Get Request by ID
// =========================
const getConsultationRequestById = catchAsync(
  async (req: Request, res: Response) => {
    const { consultationRequestId } = req.params;

    const result =
      await ConsultationRequestService.getConsultationRequestById(
        consultationRequestId as string
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Consultation request retrieved successfully',
      data: result,
    });
  }
);

// =========================
// Update Request
// =========================
const updateConsultationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { consultationRequestId } = req.params;
    const payload = req.body;

    const result =
      await ConsultationRequestService.updateConsultationRequest(
        consultationRequestId as string,
        payload
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Consultation request updated successfully',
      data: result,
    });
  }
);

// =========================
// Delete Request
// =========================
const deleteConsultationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { consultationRequestId } = req.params;

    const result =
      await ConsultationRequestService.deleteConsultationRequest(
        consultationRequestId as string
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Consultation request deleted successfully',
      data: result,
    });
  }
);

// =========================
// Export Controller
// =========================
export const ConsultationRequestController = {
  createConsultationRequest,
  getConsultationRequests,
  getConsultationRequestsByUser,
  getConsultationRequestById,
  updateConsultationRequest,
  deleteConsultationRequest,
};
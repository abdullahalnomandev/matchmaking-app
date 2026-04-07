import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { UserMatchService } from './user.match.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully. Please verify your email with the OTP sent.',
      data: result,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data: any = {
      ...req.body,
    };

    if (image && image !== 'undefined') {
      data.image = image;
    }

    if (req.body.shipping_address) {
      data.shipping_address = JSON.parse(req.body.shipping_address);
    }

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);



// Add getUserProfileById
const getUserProfileById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const requestUser = req.params?.id;

  const result = await UserService.getUserProfileByIdFromDB(
    userId,
    requestUser
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});


const getMatchableUsers = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { role: string; id: string };
  const result = await UserMatchService.getMatchableUsers(user,req?.query);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Matchable users retrieved successfully',
    pagination: result?.meta,
    data: result?.data,
  });
});


const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.changePassword(user, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Password changed successfully',
    data: result,
  });
});


const getMatchCount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { role: string; id: string };
  const result = await UserMatchService.getMatchCount(user);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Match count retrieved successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getUserProfile,
  updateProfile,
  getUserProfileById,
  getMatchableUsers,
  changePassword,
  getMatchCount,
};

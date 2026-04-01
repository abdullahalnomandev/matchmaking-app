import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../modules/user/user.model';
import ApiError from '../../errors/ApiError';

const validateActivation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!user.is_activated) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Your account is not activated. Please complete your profile, company details, and psychological/personality tests to proceed.'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validateActivation;

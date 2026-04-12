import { Webinar } from './webinar.model';
import { IWebinar, IWebinarFilters } from './webinar.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';

const createWebinarToDB = async (
  payload: Partial<IWebinar>,
): Promise<IWebinar> => {
  const webinar = await Webinar.create(payload);
  return webinar;
};

const getAllWebinarsFromDB = async (
  query: Record<string, unknown>,
  userId: string,
): Promise<{ data: IWebinar[]; meta: any }> => {
  const user = await User.findById(userId, 'business_area');
  
  // Set default filter for published webinars
  query.isPublished = true;
  
  // Add business area filtering if user has business_area
  if (user?.business_area) {
    const relevantSupportAreas: string[] = [];
    
    // Find all support areas that match user's business area
    Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(([supportArea, businessAreas]) => {
      if (user.business_area && businessAreas.includes(user.business_area)) {
        relevantSupportAreas.push(supportArea);
      }
    });
    
    // If we found relevant support areas, filter webinars by those areas
    if (relevantSupportAreas.length > 0) {
      query.supportArea = { $in: relevantSupportAreas };
    }
  }
  
  const queryBuilder = new QueryBuilder(Webinar.find(), query)
    .search(['title', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('creator', 'name email business_area');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getWebinarByIdFromDB = async (
  id: string,
): Promise<IWebinar | null> => {
  const webinar = await Webinar.findById(id).populate(
    'creator',
    'name email business_area',
  );
  return webinar;
};

const updateWebinarToDB = async (
  id: string,
  payload: Partial<IWebinar>,
): Promise<IWebinar | null> => {
  const webinar = await Webinar.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!webinar) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Webinar not found');
  }

  return webinar;
};

const deleteWebinarFromDB = async (id: string): Promise<void> => {
  try {
    const webinar = await Webinar.findByIdAndDelete(id);

    if (!webinar) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Webinar not found');
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete webinar');
  }
};

const toggleWebinarStatus = async (
  id: string,
  status: 'scheduled' | 'live' | 'completed',
): Promise<IWebinar | null> => {
  try {
    const webinar = await Webinar.findById(id);

    if (!webinar) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Webinar not found');
    }

    webinar.status = status;
    await webinar.save();

    return webinar;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update webinar status',
    );
  }
};

const toggleWebinarPublishStatus = async (
  id: string,
): Promise<IWebinar | null> => {
  try {
    const webinar = await Webinar.findById(id);

    if (!webinar) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Webinar not found');
    }

    webinar.isPublished = !webinar.isPublished;
    await webinar.save();

    return webinar;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to toggle webinar publish status',
    );
  }
};

const toggleCommentsStatus = async (
  id: string,
): Promise<IWebinar | null> => {
  try {
    const webinar = await Webinar.findById(id);

    if (!webinar) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Webinar not found');
    }

    webinar.commentsEnabled = !webinar.commentsEnabled;
    await webinar.save();

    return webinar;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to toggle comments status',
    );
  }
};

const getUpcomingWebinars = async (
  query: Record<string, unknown>,
  userId: string,
): Promise<{ data: IWebinar[]; meta: any }> => {
  const user = await User.findById(userId, 'business_area');
  
  // Set filters for upcoming live webinars
  query.type = 'LIVE';
  query.status = 'scheduled';
  query.isPublished = true;
  query.scheduledAt = { $gte: new Date() };
  
  // Add business area filtering if user has business_area
  if (user?.business_area) {
    const relevantSupportAreas: string[] = [];
    
    Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(([supportArea, businessAreas]) => {
      if (user.business_area && businessAreas.includes(user.business_area)) {
        relevantSupportAreas.push(supportArea);
      }
    });
    
    if (relevantSupportAreas.length > 0) {
      query.supportArea = { $in: relevantSupportAreas };
    }
  }
  
  const queryBuilder = new QueryBuilder(Webinar.find(), query)
    .search(['title', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('creator', 'name email business_area');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

export const WebinarService = {
  createWebinarToDB,
  getAllWebinarsFromDB,
  getWebinarByIdFromDB,
  updateWebinarToDB,
  deleteWebinarFromDB,
  toggleWebinarStatus,
  toggleWebinarPublishStatus,
  toggleCommentsStatus,
  getUpcomingWebinars,
};

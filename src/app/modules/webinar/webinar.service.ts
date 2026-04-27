import { Webinar } from './webinar.model';
import { IWebinar, IWebinarFilters } from './webinar.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';
import { WebinarType } from './webinar.constant';
import { Company } from '../company/company.model';
import { USER_ROLES } from '../../../enums/user';

const createWebinarToDB = async (
  payload: Partial<IWebinar>,
): Promise<IWebinar> => {
  if (payload.type === WebinarType.LIVE) {
    payload.videoUrl = undefined;
    // Validate required fields for live webinars
    if (!payload.meetingUrl) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Meeting URL is required for live webinars',
      );
    }
    if (!payload.scheduledAt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Scheduled date is required for live webinars',
      );
    }

    if (!payload.durationMinutes) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Duration is required for live webinars',
      );
    }
  }

  if (payload.type === WebinarType.RECORDING) {
    payload.meetingUrl = undefined;
    payload.scheduledAt = undefined;
    payload.durationMinutes = undefined;

    if (!payload.videoUrl) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Video url is required for recording webinars',
      );
    }
  }

  console.log('payload', payload);
  const webinar = await Webinar.create(payload);
  return webinar;
};

const getAllWebinarsFromDB = async (
  query: Record<string, unknown>,
  userId: string,
  userRole: string
): Promise<{ data: IWebinar[]; meta: any }> => {
  const companies = await Company.find(
    { owner: userId },
    'business_area',
  ).lean();

  if (!companies.length) {
    return { data: [], meta: { total: 0, page: 1, limit: 0 } };
  }

  const businessAreas = companies
    .map(c => c.business_area)
    .filter(Boolean) as string[];

  const relevantSupportAreasSet = new Set<string>();

  const relevantSupportAreas = Array.from(relevantSupportAreasSet);

  const baseQuery: any = {
    isPublished: true
  };

  if (userRole === USER_ROLES.SUPPORT_PARTNER) {
    baseQuery.creator = userId;
  } else {
    if (relevantSupportAreas.length > 0) {
      baseQuery.supportArea = { $in: relevantSupportAreas };
    }
  }

  const queryBuilder = new QueryBuilder(Webinar.find(baseQuery), query)
    .search(['title', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [result, meta] = await Promise.all([
    queryBuilder.modelQuery
      .populate('creator', 'name email business_area')
      .lean(),
    queryBuilder.getPaginationInfo(),
  ]);

  const now = new Date();

  const data = result.map((webinar: any) => {
    let dynamicStatus = webinar.status;

    if (webinar.type === 'RECORDING') {
      dynamicStatus = 'recorded';
    }

    if (webinar.type === 'LIVE' && webinar.scheduledAt) {
      const start = new Date(webinar.scheduledAt);

      const end = webinar.durationMinutes
        ? new Date(start.getTime() + webinar.durationMinutes * 60000)
        : new Date(start.getTime() + 60 * 60000);

      if (now < start) dynamicStatus = 'upcoming';
      else if (now <= end) dynamicStatus = 'live';
      else dynamicStatus = 'completed';
    }

    return {
      ...webinar,
      status: dynamicStatus,
    };
  });

  return { data, meta };
};

const getWebinarByIdFromDB = async (id: string): Promise<IWebinar | null> => {
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

const toggleCommentsStatus = async (id: string): Promise<IWebinar | null> => {
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

    Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(
      ([supportArea, businessAreas]) => {
        if (user.business_area && businessAreas.includes(user.business_area)) {
          relevantSupportAreas.push(supportArea);
        }
      },
    );

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

  const result = await queryBuilder.modelQuery.populate(
    'creator',
    'name email business_area',
  );
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

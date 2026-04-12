import { Newsletter } from './newsletter.model';
import { INewsletter } from './newsletter.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';

const createNewsletterToDB = async (
  payload: Partial<INewsletter>,
): Promise<INewsletter> => {

  console.log("payload",payload)
  const newsletter = await Newsletter.create(payload);

  return newsletter;
};

const getAllNewslettersFromDB = async (
  query: Record<string, unknown>,
  userId: string
): Promise<{ data: INewsletter[]; meta: any }> => {
  const user = await User.findById(userId, 'business_area')
  console.log('businessare',user)
  
  // Set default filter for active newsletters
  query.isActive = true;
  
  // Add business area filtering if user has business_area
  if (user?.business_area) {
    const relevantSupportAreas: string[] = [];
    
    // Find all support areas that match user's business area
    Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(([supportArea, businessAreas]) => {
      if (user.business_area && businessAreas.includes(user.business_area)) {
        relevantSupportAreas.push(supportArea);
      }
    });
    
    // If we found relevant support areas, filter newsletters by creators in those areas
    if (relevantSupportAreas.length > 0) {
      // Get users who have business areas that can provide support to current user
      const supportingUsers = await User.find({
        business_area: { $in: relevantSupportAreas }
      }).select('_id');
      
      const supportingUserIds = supportingUsers.map(u => u._id);
      
      // Filter newsletters to only show those created by users in relevant support areas
      query.createdBy = { $in: supportingUserIds };
    }
  }
  
  const queryBuilder = new QueryBuilder(Newsletter.find(), query)
    .search(['title', 'content'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate('createdBy', 'name email business_area');
  const meta = await queryBuilder.getPaginationInfo();

  return {
    data: result,
    meta,
  };
};

const getNewsletterByIdFromDB = async (
  id: string,
): Promise<INewsletter | null> => {
    const newsletter = await Newsletter.findById(id).populate(
      'createdBy',
      'name email business_area',
    );
    return newsletter;
};

const updateNewsletterToDB = async (
  id: string,
  payload: Partial<INewsletter>,
): Promise<INewsletter | null> => {
    const newsletter = await Newsletter.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!newsletter) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Newsletter not found');
    }

    return newsletter;
  };

const deleteNewsletterFromDB = async (id: string): Promise<void> => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(id);

    if (!newsletter) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Newsletter not found');
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete newsletter');
  }
};

const toggleNewsletterStatus = async (
  id: string,
): Promise<INewsletter | null> => {
  try {
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Newsletter not found');
    }

    newsletter.isActive = !newsletter.isActive;
    await newsletter.save();

    return newsletter;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to toggle newsletter status',
    );
  }
};

export const NewsletterService = {
  createNewsletterToDB,
  getAllNewslettersFromDB,
  getNewsletterByIdFromDB,
  updateNewsletterToDB,
  deleteNewsletterFromDB,
  toggleNewsletterStatus,
};

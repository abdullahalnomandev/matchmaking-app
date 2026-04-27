import { Newsletter } from './newsletter.model';
import { INewsletter } from './newsletter.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';
import { Company } from '../company/company.model';
import { USER_ROLES } from '../../../enums/user';

const createNewsletterToDB = async (
  payload: Partial<INewsletter>,
): Promise<INewsletter> => {
  console.log('payload', payload);
  const newsletter = await Newsletter.create(payload);

  return newsletter;
};

const getAllNewslettersFromDB = async (
  query: Record<string, unknown>,
  userId: string,
  role: string,
): Promise<{ data: INewsletter[]; meta: any }> => {
  const user = await User.findById(userId);
  console.log('Found user:', user);

  // Check user role
  let baseQuery = {};
  
  if (role === USER_ROLES.SUPPORT_PARTNER) {
    console.log(
      'User role is support area. Showing newsletters created by her',
    );
    baseQuery = { createdBy: userId };
  } else {
    const companies = await Company.find({ owner: userId }, 'business_area');
    console.log('Found companies for user', userId, ':', companies.length);

    const filterArea: string[] = [];

    companies.forEach(company => {
      console.log('Company data:', company);
      if (!company.business_area) {
        return;
      }

      const businessArea = company.business_area;

      Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(
        ([supportArea, businessAreas]) => {
          if (businessAreas.includes(businessArea)) {
            filterArea.push(supportArea);
          }
        },
      );
    });

    console.log('Final filter areas (relevant support areas):', filterArea);

    // Set default filter for active newsletters
    baseQuery = { area: { $in: filterArea } };
  }

  console.log('Base query:', baseQuery);
  const queryBuilder = new QueryBuilder(Newsletter.find(baseQuery), query)
    .search(['title', 'content'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const result = await queryBuilder.modelQuery.populate(
    'createdBy',
    'name image email business_area',
  );
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

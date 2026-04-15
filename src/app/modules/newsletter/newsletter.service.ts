import { Newsletter } from './newsletter.model';
import { INewsletter } from './newsletter.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';
import { Company } from '../company/company.model';

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
): Promise<{ data: INewsletter[]; meta: any }> => {
  const companies = await Company.find({ owner: userId }, 'business_area');
  console.log('Found companies for user', userId, ':', companies.length);
  
  const filterArea: string[] = [];

  companies.forEach((company) => {
    console.log('Company data:', company);
    if (!company.business_area) {
      console.log('Skipping company - no business area:', company._id);
      return; // Skip if no business area
    }
    
    const businessArea = company.business_area;
    console.log('Processing business area:', businessArea);
    
    // Find all support areas that are relevant to this business area
    Object.entries(SUPPORT_TO_BUSINESS_MAP).forEach(([supportArea, businessAreas]) => {
      if (businessAreas.includes(businessArea)) {
        console.log('Found relevant support area:', supportArea, 'for business area:', businessArea);
        filterArea.push(supportArea);
      }
    });
  });
  
  console.log('Final filter areas (relevant support areas):', filterArea);

  // Set default filter for active newsletters
  query.isActive = true;

  const queryBuilder = new QueryBuilder(
    Newsletter.find({ area: { $in: filterArea } }),
    query,
  )
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

import { Newsletter } from './newsletter.model';
import { INewsletter, INewsletterFilters } from './newsletter.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createNewsletterToDB = async (
  payload: Partial<INewsletter>,
): Promise<INewsletter> => {

  console.log("payload",payload)
  const newsletter = await Newsletter.create(payload);

  return newsletter;
};

const getAllNewslettersFromDB = async (
  filters: INewsletterFilters,
): Promise<{ data: INewsletter[]; meta: any }> => {
  const { search, isActive, createdBy, page = 1, limit = 10 } = filters;

  // Build query
  let query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Count total documents
    const total = await Newsletter.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const newsletters = await Newsletter.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const meta = {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };

    return {
      data: newsletters,
      meta,
    };
};

const getNewsletterByIdFromDB = async (
  id: string,
): Promise<INewsletter | null> => {
    const newsletter = await Newsletter.findById(id).populate(
      'createdBy',
      'name email',
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

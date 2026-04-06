import { Faq } from './faq.model';
import { IFaq, IFaqFilters } from './faq.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createFaqToDB = async (payload: Partial<IFaq>): Promise<IFaq> => {
  try {
    const faq = await Faq.create(payload);
    return faq;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create FAQ');
  }
};

const getAllFaqsFromDB = async (filters: IFaqFilters): Promise<{ data: IFaq[], meta: any }> => {
  try {
    const { search, isActive, page = 1, limit = 10 } = filters;
    
    // Build query
    let query: any = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Count total documents
    const total = await Faq.countDocuments(query);
    
    // Get paginated results
    const skip = (page - 1) * limit;
    const faqs = await Faq.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const meta = {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    };
    
    return {
      data: faqs,
      meta
    };
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to fetch FAQs');
  }
};

const getFaqByIdFromDB = async (id: string): Promise<IFaq | null> => {
  try {
    const faq = await Faq.findById(id);
    return faq;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to fetch FAQ');
  }
};

const updateFaqToDB = async (id: string, payload: Partial<IFaq>): Promise<IFaq | null> => {
  try {
    const faq = await Faq.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    );
    
    if (!faq) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
    }
    
    return faq;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update FAQ');
  }
};

const deleteFaqFromDB = async (id: string): Promise<void> => {
  try {
    const faq = await Faq.findByIdAndDelete(id);
    
    if (!faq) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete FAQ');
  }
};

const toggleFaqStatus = async (id: string): Promise<IFaq | null> => {
  try {
    const faq = await Faq.findById(id);
    
    if (!faq) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'FAQ not found');
    }
    
    faq.isActive = !faq.isActive;
    await faq.save();
    
    return faq;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to toggle FAQ status');
  }
};

export const FaqService = {
  createFaqToDB,
  getAllFaqsFromDB,
  getFaqByIdFromDB,
  updateFaqToDB,
  deleteFaqFromDB,
  toggleFaqStatus
};

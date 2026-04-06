export interface IFaq {
  _id?: string;
  title: string;
  description: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFaqFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

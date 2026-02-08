import { CreateBookRequest, UpdateBookRequest } from '@/shared/contracts';

export interface BookCreateData extends CreateBookRequest {
  createdBy: string;
}

export interface BookUpdateData extends UpdateBookRequest {
  updatedBy: string;
}

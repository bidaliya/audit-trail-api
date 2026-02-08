import { BookModel, IBook } from './book.model';
import { BookCreateData, BookUpdateData } from './book.types';
import { decodeCursor } from '@/shared/http/pagination';
import mongoose from 'mongoose';
import type { FilterQuery } from 'mongoose';

export class BookRepository {
  async findAll(limit: number, cursor?: string): Promise<IBook[]> {
    const query: FilterQuery<IBook> = { deletedAt: null };

    if (cursor) {
      const { createdAt, _id } = decodeCursor(cursor);
      query.$or = [
        { createdAt: { $lt: new Date(createdAt!) } },
        { 
          createdAt: new Date(createdAt!),
          _id: { $lt: new mongoose.Types.ObjectId(_id) }
        },
      ];
    }

    return BookModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<IBook | null> {
    return BookModel.findOne({ _id: id, deletedAt: null }).exec();
  }

  async create(data: BookCreateData): Promise<IBook> {
    const book = new BookModel({
      ...data,
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
    });
    return book.save();
  }

  async update(id: string, data: BookUpdateData): Promise<IBook | null> {
    return BookModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { 
        ...data,
        updatedBy: new mongoose.Types.ObjectId(data.updatedBy),
      },
      { new: true }
    ).exec();
  }

  async softDelete(id: string): Promise<IBook | null> {
    return BookModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).exec();
  }

  // Used by audit service to get previous state
  async findByIdIncludingDeleted(id: string): Promise<IBook | null> {
    return BookModel.findById(id).exec();
  }
}

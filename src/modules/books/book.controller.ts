import { Request, Response, NextFunction } from 'express';
import { BookService } from './book.service';
import { CreateBookRequest, UpdateBookRequest, createBookSchema, paginationQuerySchema, updateBookSchema } from '@/shared/contracts';
import { getUserId } from '@/infra/requestContext/context';
import { sendSuccess, sendCreated } from '@/shared/http/response';
import { buildPaginationResponse } from '@/shared/http/pagination';
import { UnauthorizedError } from '@/shared/errors/AppError';

export class BookController {
  constructor(private service: BookService) {}

  getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit, cursor } = paginationQuerySchema.parse(req.query);

      const books = await this.service.getBooks(limit, cursor);
      const response = buildPaginationResponse(books, limit, 'createdAt');

      sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  };

  getBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const book = await this.service.getBookById(req.params.id);
      sendSuccess(res, book);
    } catch (error) {
      next(error);
    }
  };

  createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new UnauthorizedError('User ID not found in context');
      }

      const bookData: CreateBookRequest = createBookSchema.parse(req.body);
      const book = await this.service.createBook({
        ...bookData,
        createdBy: userId,
      });

      sendCreated(res, { id: book._id.toString() });
    } catch (error) {
      next(error);
    }
  };

  updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new UnauthorizedError('User ID not found in context');
      }

      const updateData: UpdateBookRequest = updateBookSchema.parse(req.body);
      const book = await this.service.updateBook(req.params.id, {
        ...updateData,
        updatedBy: userId,
      });

      sendSuccess(res, book);
    } catch (error) {
      next(error);
    }
  };

  deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteBook(req.params.id);
      sendSuccess(res, { ok: true });
    } catch (error) {
      next(error);
    }
  };
}

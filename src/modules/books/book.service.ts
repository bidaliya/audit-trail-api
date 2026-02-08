import { BookRepository } from './book.repository';
import { BookCreateData, BookUpdateData } from './book.types';
import { IBook } from './book.model';
import { NotFoundError } from '@/shared/errors/AppError';
import { getAuditTrailService } from '@/modules/auditTrail';
import { AUDITABLE_ENTITIES, AUDIT_ACTIONS } from '@/shared/contracts';
import { logger } from '@/config/logger';

export class BookService {
  private auditService = getAuditTrailService();

  constructor(private repository: BookRepository) {}

  async getBooks(limit: number, cursor?: string): Promise<IBook[]> {
    return this.repository.findAll(limit, cursor);
  }

  async getBookById(id: string): Promise<IBook> {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    return book;
  }

  async createBook(data: BookCreateData): Promise<IBook> {
    const book = await this.repository.create(data);
    
    // Record audit - CREATE action
    await this.auditService.recordAudit(
      AUDITABLE_ENTITIES.BOOK,
      book._id.toString(),
      AUDIT_ACTIONS.CREATE,
      null,
      book.toObject()
    );

    logger.info({ bookId: book._id }, 'Book created');
    return book;
  }

  async updateBook(id: string, data: BookUpdateData): Promise<IBook> {
    // Get the current state before update
    const beforeBook = await this.repository.findById(id);
    if (!beforeBook) {
      throw new NotFoundError('Book not found');
    }

    const beforeState = beforeBook.toObject();
    
    // Perform update
    const updatedBook = await this.repository.update(id, data);
    if (!updatedBook) {
      throw new NotFoundError('Book not found');
    }

    const afterState = updatedBook.toObject();

    // Record audit - UPDATE action
    await this.auditService.recordAudit(
      AUDITABLE_ENTITIES.BOOK,
      id,
      AUDIT_ACTIONS.UPDATE,
      beforeState,
      afterState
    );

    logger.info({ bookId: id }, 'Book updated');
    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    // Get the current state before deletion
    const book = await this.repository.findById(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    const beforeState = book.toObject();
    
    // Soft delete
    await this.repository.softDelete(id);

    // Record audit - DELETE action
    await this.auditService.recordAudit(
      AUDITABLE_ENTITIES.BOOK,
      id,
      AUDIT_ACTIONS.DELETE,
      beforeState,
      null
    );

    logger.info({ bookId: id }, 'Book deleted');
  }
}

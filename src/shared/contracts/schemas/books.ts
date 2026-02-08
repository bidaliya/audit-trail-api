import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  authors: z.array(z.string().min(1)).min(1, 'At least one author is required'),
  publishedBy: z.string().min(1, 'Publisher is required'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  authors: z.array(z.string().min(1)).min(1).optional(),
  publishedBy: z.string().min(1).optional(),
});

export const bookSchema = z.object({
  _id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  publishedBy: z.string(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional().nullable(),
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

export const booksResponseSchema = z.object({
  items: z.array(bookSchema),
  nextCursor: z.string().optional(),
});

export type CreateBookRequest = z.infer<typeof createBookSchema>;
export type UpdateBookRequest = z.infer<typeof updateBookSchema>;
export type Book = z.infer<typeof bookSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type BooksResponse = z.infer<typeof booksResponseSchema>;

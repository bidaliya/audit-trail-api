import { Router } from 'express';
import { BookRepository } from './book.repository';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { createBookRoutes } from './book.routes';
import { AuthMiddleware } from '@/modules/auth';

export function createBookModule(authMiddleware: AuthMiddleware): Router {
  const repository = new BookRepository();
  const service = new BookService(repository);
  const controller = new BookController(service);
  const router = createBookRoutes(controller, authMiddleware);

  return router;
}

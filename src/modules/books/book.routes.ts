import { Router } from 'express';
import { BookController } from './book.controller';
import { AuthMiddleware } from '@/modules/auth';

export function createBookRoutes(
  controller: BookController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // All book routes require authentication
  router.use(authMiddleware.authenticate);

  router.get(
    '/',
    controller.getBooks
  );

  router.get('/:id', controller.getBook);

  router.post(
    '/',
    controller.createBook
  );

  router.patch(
    '/:id',
    controller.updateBook
  );

  router.delete('/:id', controller.deleteBook);

  return router;
}

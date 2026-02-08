import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectToDatabase, disconnectFromDatabase } from '@/infra/db/mongoose';
import { logger } from '@/config/logger';
import { UserModel } from '@/modules/auth/user.model';
import { BookModel } from '@/modules/books/book.model';
import { USER_ROLES } from '@/shared/contracts';

dotenv.config();

async function seed() {
  try {
    logger.info('Starting seed...');
    await connectToDatabase();

    // Clear existing data
    await UserModel.deleteMany({});
    await BookModel.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const reviewerPassword = await bcrypt.hash('reviewer123', 10);

    const admin = await UserModel.create({
      name: 'admin',
      credentials: adminPassword,
      role: USER_ROLES.ADMIN,
    });

    const reviewer = await UserModel.create({
      name: 'reviewer',
      credentials: reviewerPassword,
      role: USER_ROLES.REVIEWER,
    });

    logger.info('Created users');
    logger.info({ admin: 'admin / admin123' }, 'Admin credentials');
    logger.info({ reviewer: 'reviewer / reviewer123' }, 'Reviewer credentials');

    // Create books
    const books = await BookModel.create([
      {
        title: 'The Pragmatic Programmer',
        authors: ['Andrew Hunt', 'David Thomas'],
        publishedBy: 'Addison-Wesley',
        createdBy: admin._id,
      },
      {
        title: 'Clean Code',
        authors: ['Robert C. Martin'],
        publishedBy: 'Prentice Hall',
        createdBy: reviewer._id,
      },
      {
        title: 'Design Patterns',
        authors: ['Erich Gamma', 'Richard Helm', 'Ralph Johnson', 'John Vlissides'],
        publishedBy: 'Addison-Wesley',
        createdBy: admin._id,
      },
    ]);

    logger.info({ count: books.length }, 'Created books');

    const separator = '='.repeat(60);
    logger.info('Seed completed successfully!');
    logger.info('');
    logger.info(separator);
    logger.info('SEED DATA SUMMARY');
    logger.info(separator);
    logger.info('Users:');
    logger.info('  Admin:    name=admin, credential=admin123');
    logger.info('  Reviewer: name=reviewer, credential=reviewer123');
    logger.info('');
    logger.info(`Books created: ${books.length}`);
    logger.info(separator);
  } catch (error) {
    logger.error({ error }, 'Seed failed');
    process.exitCode = 1;
  } finally {
    try {
      await disconnectFromDatabase();
    } catch (error) {
      logger.error({ error }, 'Seed cleanup failed');
      process.exitCode = process.exitCode ?? 1;
    }
  }
}

seed();

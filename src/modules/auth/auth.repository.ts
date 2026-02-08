import { UserModel, IUser } from './user.model';
import { UserRole } from '@/shared/contracts';

export class AuthRepository {
  async findByName(name: string): Promise<IUser | null> {
    return UserModel.findOne({ name }).exec();
  }

  async findByNameLike(name: string): Promise<IUser[]> {
    const trimmed = name.trim();
    if (!trimmed) {
      return [];
    }

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    return UserModel.find({ name: { $regex: regex } }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<IUser[]> {
    if (ids.length === 0) {
      return [];
    }
    return UserModel.find({ _id: { $in: ids } }).exec();
  }

  async create(data: { name: string; credentials: string; role: UserRole }): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }
}

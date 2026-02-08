import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, USER_ROLES } from '@/shared/contracts';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  credentials: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    credentials: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Index for faster lookups
userSchema.index({ name: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  authors: string[];
  publishedBy: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 500,
    },
    authors: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one author is required',
      },
    },
    publishedBy: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'books',
  }
);

// Indexes for pagination and queries
bookSchema.index({ createdAt: -1, _id: -1 });
bookSchema.index({ deletedAt: 1 }); // For filtering out soft-deleted

export const BookModel = mongoose.model<IBook>('Book', bookSchema);

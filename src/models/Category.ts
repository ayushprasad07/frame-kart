import mongoose, { Schema, Document } from 'mongoose';
import { PRODUCT_CATEGORIES } from './Product';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      enum: {
        values: Object.values(PRODUCT_CATEGORIES),
        message: '{VALUE} is not a valid category'
      },
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Category description is required'],
      maxLength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
      type: String,
      required: [true, 'Category image is required']
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    productCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ displayOrder: 1, isActive: 1 });
CategorySchema.index({ name: 1 });

const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
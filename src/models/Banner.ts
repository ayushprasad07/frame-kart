import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  linkText?: string;
  displayOrder: number;
  isActive: boolean;
  type: 'hero' | 'promotional';
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      maxLength: [100, 'Title cannot exceed 100 characters']
    },
    subtitle: {
      type: String,
      maxLength: [200, 'Subtitle cannot exceed 200 characters']
    },
    image: {
      type: String,
      required: [true, 'Banner image is required']
    },
    link: {
      type: String
    },
    linkText: {
      type: String,
      default: 'Shop Now'
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['hero', 'promotional'],
      default: 'hero'
    },
    backgroundColor: {
      type: String
    },
    textColor: {
      type: String
    },
    buttonColor: {
      type: String,
      default: '#3b82f6'
    },
    buttonTextColor: {
      type: String,
      default: '#ffffff'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
BannerSchema.index({ type: 1, isActive: 1, displayOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

const Banner = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
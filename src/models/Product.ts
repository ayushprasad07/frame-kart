import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISizeOption {
  size: string; // e.g., "A4", "A3", "12x18", "24x36"
  price: number;
  offerPrice?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: string; // "inches", "cm", etc.
  };
}

export interface IStyleOption {
  name: string; // e.g., "Modern", "Vintage", "Wooden"
  // image: string; // Style preview image
  additionalPrice?: number; // Extra cost for this style
}

export interface IProduct extends Document {
  title: string;
  basePrice: number;
  offerPrice?: number;
  description: string;
  detailedDescription?: string;
  category: string;
  subCategory?: string;
  material: string;
  isAvailable: boolean;
  stockQuantity: number;
  sku: string;
  
  // Size and style options
  sizes: ISizeOption[];
  styles: IStyleOption[];
  
  // Media
  images: string[];
  featuredImage: string;
  
  // Metadata
  tags: string[];
  weight?: number; // for shipping calculations
  deliveryEstimate: string; // e.g., "3-5 days"
  
  // Admin controls
  isActive: boolean;
  isFeatured: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const SizeOptionSchema: Schema = new Schema<ISizeOption>({
  size: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    min: 0
  },
  dimensions: {
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'inches'
    }
  }
});

const StyleOptionSchema: Schema = new Schema<IStyleOption>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // image: {
  //   type: String,
  //   required: true
  // },
  additionalPrice: {
    type: Number,
    default: 0,
    min: 0
  }
});

const ProductSchema: Schema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters']
    },
    basePrice: {
      type: Number,
      required: [true, 'Product base price is required'],
      min: [0, 'Price must be positive']
    },
    offerPrice: {
      type: Number,
      min: [0, 'Offer price must be positive']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    detailedDescription: {
      type: String,
      maxLength: [5000, 'Detailed description cannot exceed 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    material: {
      type: String,
      required: [true, 'Product material is required'],
      trim: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true
    },
    
    // Size and style options
    sizes: [SizeOptionSchema],
    styles: [StyleOptionSchema],
    
    // Media
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(images: string[]) {
          return images.length <= 10; // Limit number of images
        },
        message: 'Cannot have more than 10 images'
      }
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required']
    },
    
    // Metadata
    tags: [{
      type: String,
      trim: true
    }],
    weight: {
      type: Number,
      min: 0
    },
    deliveryEstimate: {
      type: String,
      default: '5-7 business days'
    },
    
    // Admin controls
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1, isFeatured: 1 });
// ProductSchema.index({ sku: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
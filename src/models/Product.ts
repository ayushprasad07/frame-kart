// import mongoose, { Schema, Document, Model } from 'mongoose';

// export interface ISizeOption {
//   size: string; // e.g., "A4", "A3", "12x18", "24x36"
//   price: number;
//   offerPrice?: number;
//   dimensions?: {
//     width: number;
//     height: number;
//     unit: string; // "inches", "cm", etc.
//   };
// }

// export interface IStyleOption {
//   name: string; // e.g., "Modern", "Vintage", "Wooden"
//   // image: string; // Style preview image
//   additionalPrice?: number; // Extra cost for this style
// }

// export interface IProduct extends Document {
//   title: string;
//   basePrice: number;
//   offerPrice?: number;
//   description: string;
//   detailedDescription?: string;
//   category: string;
//   subCategory?: string;
//   material: string;
//   isAvailable: boolean;
//   stockQuantity: number;
//   sku: string;
  
//   // Size and style options
//   sizes: ISizeOption[];
//   styles: IStyleOption[];
  
//   // Media
//   images: string[];
//   featuredImage: string;
  
//   // Metadata
//   tags: string[];
//   weight?: number; // for shipping calculations
//   deliveryEstimate: string; // e.g., "3-5 days"
  
//   // Admin controls
//   isActive: boolean;
//   isFeatured: boolean;
  
//   // Timestamps
//   createdAt: Date;
//   updatedAt: Date;
// }

// const SizeOptionSchema: Schema = new Schema<ISizeOption>({
//   size: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   offerPrice: {
//     type: Number,
//     min: 0
//   },
//   dimensions: {
//     width: Number,
//     height: Number,
//     unit: {
//       type: String,
//       default: 'inches'
//     }
//   }
// });

// const StyleOptionSchema: Schema = new Schema<IStyleOption>({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   // image: {
//   //   type: String,
//   //   required: true
//   // },
//   additionalPrice: {
//     type: Number,
//     default: 0,
//     min: 0
//   }
// });

// const ProductSchema: Schema = new Schema<IProduct>(
//   {
//     title: {
//       type: String,
//       required: [true, 'Product title is required'],
//       trim: true,
//       maxLength: [200, 'Title cannot exceed 200 characters']
//     },
//     basePrice: {
//       type: Number,
//       required: [true, 'Product base price is required'],
//       min: [0, 'Price must be positive']
//     },
//     offerPrice: {
//       type: Number,
//       min: [0, 'Offer price must be positive']
//     },
//     description: {
//       type: String,
//       required: [true, 'Product description is required'],
//       maxLength: [1000, 'Description cannot exceed 1000 characters']
//     },
//     detailedDescription: {
//       type: String,
//       maxLength: [5000, 'Detailed description cannot exceed 5000 characters']
//     },
//     category: {
//       type: String,
//       required: [true, 'Product category is required'],
//       trim: true
//     },
//     subCategory: {
//       type: String,
//       trim: true
//     },
//     material: {
//       type: String,
//       required: [true, 'Product material is required'],
//       trim: true
//     },
//     isAvailable: {
//       type: Boolean,
//       default: true
//     },
//     stockQuantity: {
//       type: Number,
//       default: 0,
//       min: 0
//     },
//     sku: {
//       type: String,
//       required: [true, 'SKU is required'],
//       unique: true,
//       trim: true
//     },
    
//     // Size and style options
//     sizes: [SizeOptionSchema],
//     styles: [StyleOptionSchema],
    
//     // Media
//     images: {
//       type: [String],
//       default: [],
//       validate: {
//         validator: function(images: string[]) {
//           return images.length <= 10; // Limit number of images
//         },
//         message: 'Cannot have more than 10 images'
//       }
//     },
//     featuredImage: {
//       type: String,
//       required: [true, 'Featured image is required']
//     },
    
//     // Metadata
//     tags: [{
//       type: String,
//       trim: true
//     }],
//     weight: {
//       type: Number,
//       min: 0
//     },
//     deliveryEstimate: {
//       type: String,
//       default: '5-7 business days'
//     },
    
//     // Admin controls
//     isActive: {
//       type: Boolean,
//       default: true
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// // Index for better search performance
// ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
// ProductSchema.index({ category: 1, isActive: 1, isFeatured: 1 });
// // ProductSchema.index({ sku: 1 });

// const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

// export default Product;

// product.model.ts (Updated)
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define category constants
export const PRODUCT_CATEGORIES = {
  WOODEN_FRAMES: 'Wooden Frames',
  METAL_FRAMES: 'Metal Frames',
  COLLAGE_FRAMES: 'Collage & Multi-Photo Frames',
  CUSTOM_FRAMES: 'Custom Frames',
  ACRYLIC_FRAMES: 'Acrylic Frames',
  GLASS_FRAMES: 'Glass Frames',
  CANVAS_FRAMES: 'Canvas Frames',
  BAMBOO_FRAMES: 'Bamboo & Eco-Friendly Frames',
  TABLE_TOP_FRAMES: 'Tabletop Frames',
  DIGITAL_PRINTS: 'Digital Prints',
  ART_WALL_DECOR: 'Art & Wall Decor',
  GIFT_SETS: 'Gift Sets',
  OFFICE_CORPORATE: 'Office & Corporate',
  SEASONAL: 'Seasonal & Occasional'
} as const;

export const PRODUCT_SUBCATEGORIES = {
  // Wooden Frames subcategories
  TEAK_WOOD: 'Teak Wood',
  SHEESHAM_WOOD: 'Sheesham Wood',
  MDF_FRAMES: 'MDF Frames',
  VINTAGE_WOOD: 'Vintage Wood',
  MODERN_WOOD: 'Modern Wood',
  
  // Metal Frames subcategories
  ALUMINIUM: 'Aluminium',
  STAINLESS_STEEL: 'Stainless Steel',
  BRASS: 'Brass',
  INDUSTRIAL: 'Industrial',
  
  // Styles
  MODERN: 'Modern',
  VINTAGE: 'Vintage',
  TRADITIONAL: 'Traditional',
  CONTEMPORARY: 'Contemporary',
  RUSTIC: 'Rustic',
  BOHEMIAN: 'Bohemian',
  ORNATE: 'Ornate/Gold',
  FLORAL: 'Floral',
  GEOMETRIC: 'Geometric',
  
  // Occasions
  WEDDING: 'Wedding & Anniversary',
  BIRTHDAY: 'Birthday',
  BABY_NURSERY: 'Baby & Nursery',
  FAMILY: 'Family Photos',
  TRAVEL: 'Travel Memories',
  GRADUATION: 'Graduation',
  CORPORATE: 'Corporate',
  MEMORIAL: 'Memorial'
} as const;

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
  
  // Category fields
  category: string; // Main category
  subCategory?: string; // Subcategory
  material: string;
  style?: string; // Design style
  occasion?: string; // For what occasion
  
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
  
  // Dimensions
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  
  // Frame specific
  frameType?: 'wall' | 'tabletop' | 'standing';
  shape?: 'square' | 'rectangle' | 'round' | 'oval' | 'heart';
  mountingType?: string;
  hasGlass?: boolean;
  glassType?: 'standard' | 'non-glare' | 'uv-protected' | 'acrylic';
  
  // Admin controls
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  
  // Sales data
  totalSold?: number;
  rating?: number;
  reviewCount?: number;
  
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
    
    // Category fields with enums
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: Object.values(PRODUCT_CATEGORIES),
        message: '{VALUE} is not a valid category'
      }
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
    style: {
      type: String,
      trim: true
    },
    occasion: {
      type: String,
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
          return images.length <= 10;
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
    
    // Dimensions
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: {
        type: String,
        default: 'inches'
      }
    },
    
    // Frame specific attributes
    frameType: {
      type: String,
      enum: ['wall', 'tabletop', 'standing']
    },
    shape: {
      type: String,
      enum: ['square', 'rectangle', 'round', 'oval', 'heart']
    },
    mountingType: {
      type: String,
      trim: true
    },
    hasGlass: {
      type: Boolean,
      default: false
    },
    glassType: {
      type: String,
      enum: ['standard', 'non-glare', 'uv-protected', 'acrylic']
    },
    
    // Admin controls
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    
    // Sales data
    totalSold: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better search performance
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1, isBestSeller: 1, isNewArrival: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ totalSold: -1 });
ProductSchema.index({ rating: -1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.offerPrice && this.basePrice && this.offerPrice < this.basePrice) {
    return Math.round((((this.basePrice as number) - (this.offerPrice as number)) / (this.basePrice as number)) * 100);
  }
  return 0;
});

const Product: Model<IProduct> = mongoose.models.Product || 
  mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
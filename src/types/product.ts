// src/types/product.ts - No Mongoose imports here!

// Define category constants (same as in your model but without Mongoose)
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

// Define interfaces/types without Mongoose dependencies
export interface ISizeOption {
  size: string;
  price: number;
  offerPrice?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

export interface IStyleOption {
  name: string;
  additionalPrice?: number;
}

export interface IProduct {
  _id?: string;
  title: string;
  basePrice: number;
  offerPrice?: number;
  description: string;
  detailedDescription?: string;
  category: string;
  subCategory?: string;
  material: string;
  style?: string;
  occasion?: string;
  isAvailable: boolean;
  stockQuantity: number;
  sku: string;
  sizes: ISizeOption[];
  styles: IStyleOption[];
  images: string[];
  featuredImage: string;
  tags: string[];
  weight?: number;
  deliveryEstimate: string;
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
    unit: string;
  };
  frameType?: 'wall' | 'tabletop' | 'standing';
  shape?: 'square' | 'rectangle' | 'round' | 'oval' | 'heart';
  mountingType?: string;
  hasGlass?: boolean;
  glassType?: 'standard' | 'non-glare' | 'uv-protected' | 'acrylic';
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  totalSold?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper function to get all category options
export const getAllCategoryOptions = () => Object.values(PRODUCT_CATEGORIES);
export const getAllStyleOptions = () => Object.values(PRODUCT_SUBCATEGORIES).slice(9, 18); // Get style options
export const getAllOccasionOptions = () => Object.values(PRODUCT_SUBCATEGORIES).slice(18); // Get occasion options
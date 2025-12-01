// src/constants/products.ts

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

// Helper functions to get options
export const getCategoryOptions = () => Object.values(PRODUCT_CATEGORIES);
export const getStyleOptions = () => {
  const subcatKeys = Object.keys(PRODUCT_SUBCATEGORIES);
  const styleStart = subcatKeys.indexOf('MODERN');
  const styleEnd = subcatKeys.indexOf('GEOMETRIC') + 1;
  return Object.values(PRODUCT_SUBCATEGORIES).slice(styleStart, styleEnd);
};
export const getOccasionOptions = () => {
  const subcatKeys = Object.keys(PRODUCT_SUBCATEGORIES);
  const occasionStart = subcatKeys.indexOf('WEDDING');
  return Object.values(PRODUCT_SUBCATEGORIES).slice(occasionStart);
};
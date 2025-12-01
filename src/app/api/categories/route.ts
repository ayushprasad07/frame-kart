// /api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { PRODUCT_CATEGORIES } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Centralized default categories configuration
const DEFAULT_CATEGORIES = [
  {
    id: 'default-1',
    name: 'Wooden Frames' as const,
    slug: 'wooden',
    description: 'Classic wooden frames with natural elegance',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=600&fit=crop&q=80',
    displayOrder: 0,
    isActive: true,
  },
  {
    id: 'default-2',
    name: 'Metal Frames' as const,
    slug: 'metal',
    description: 'Modern metal frames for contemporary spaces',
    image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600&h=600&fit=crop&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'default-3',
    name: 'Collage & Multi-Photo Frames' as const,
    slug: 'collage-multi-photo',
    description: 'Perfect for displaying multiple photos together',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'default-4',
    name: 'Custom Frames' as const,
    slug: 'custom',
    description: 'Personalized frames made just for you',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop&q=80',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'default-5',
    name: 'Canvas Frames' as const,
    slug: 'canvas',
    description: 'Canvas art frames for gallery-style display',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'default-6',
    name: 'Vintage Frames' as const,
    slug: 'vintage',
    description: 'Antique style frames with timeless charm',
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&h=600&fit=crop&q=80',
    displayOrder: 5,
    isActive: true,
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const limit = searchParams.get('limit');
    
    // Get categories from database
    let dbCategories: any[] = [];
    let defaultCategoriesOverrides: Record<string, boolean> = {};
    
    try {
      // Build query for database categories
      const query: any = {};
      if (activeOnly) {
        query.isActive = true;
      }
      
      dbCategories = await Category.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .limit(limit ? parseInt(limit) : 0)
        .lean();
      
      // Track which default categories have been overridden in the database
      defaultCategoriesOverrides = {};
      dbCategories.forEach(cat => {
        if (cat.originalDefaultId) {
          defaultCategoriesOverrides[cat.originalDefaultId] = true;
        }
        // Also check by name for compatibility
        const matchingDefault = DEFAULT_CATEGORIES.find(dc => dc.name === cat.name);
        if (matchingDefault) {
          defaultCategoriesOverrides[matchingDefault.id] = true;
        }
      });
    } catch (dbError) {
      console.error('Error fetching database categories:', dbError);
      // Continue with default categories only
    }
    
    // Get product counts for all categories (both DB and default)
    const getAllProductCounts = async (categoryName: string) => {
      try {
        return await Product.countDocuments({
          category: categoryName,
          isActive: true,
          isAvailable: true
        });
      } catch (error) {
        console.error(`Error counting products for category ${categoryName}:`, error);
        return 0;
      }
    };
    
    // Process database categories first
    const processedDbCategories = await Promise.all(
      dbCategories.map(async (category) => {
        const productCount = await getAllProductCounts(category.name);
        return {
          ...category,
          productCount,
          // Ensure _id is always a string for consistency
          _id: category._id?.toString() || category._id,
          isDefault: false // Database categories are not defaults
        };
      })
    );
    
    // Determine which default categories to include
    const defaultCategoriesToInclude = DEFAULT_CATEGORIES.filter(defaultCat => {
      // Don't include default categories that have been overridden in DB
      return !defaultCategoriesOverrides[defaultCat.id];
    });
    
    // Process default categories (only those not in DB)
    const processedDefaultCategories = await Promise.all(
      defaultCategoriesToInclude.map(async (defaultCat) => {
        const productCount = await getAllProductCounts(defaultCat.name);
        
        return {
          _id: defaultCat.id,
          name: defaultCat.name,
          slug: defaultCat.slug,
          description: defaultCat.description,
          image: defaultCat.image,
          displayOrder: defaultCat.displayOrder,
          isActive: defaultCat.isActive,
          productCount: productCount || Math.floor(Math.random() * 40) + 10, // Use real count or fallback
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true // Flag to identify default categories
        };
      })
    );
    
    // Combine both lists
    const allCategories = [...processedDbCategories, ...processedDefaultCategories];
    
    // Sort combined list
    allCategories.sort((a, b) => {
      const orderA = a.displayOrder || 999;
      const orderB = b.displayOrder || 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
    
    // Apply limit if specified
    const finalCategories = limit ? allCategories.slice(0, parseInt(limit)) : allCategories;
    
    return NextResponse.json({
      success: true,
      categories: finalCategories,
      hasDefaultCategories: processedDefaultCategories.length > 0,
      totalCategories: allCategories.length,
      dbCategoriesCount: processedDbCategories.length,
      defaultCategoriesCount: processedDefaultCategories.length
    });
    
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    
    // Fallback to static data
    const fallbackCategories = DEFAULT_CATEGORIES.map((defaultCat, index) => ({
      _id: `fallback-${index + 1}`,
      name: defaultCat.name,
      productCount: Math.floor(Math.random() * 40) + 10,
      slug: defaultCat.slug,
      description: defaultCat.description,
      image: defaultCat.image,
      displayOrder: defaultCat.displayOrder,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    }));
    
    return NextResponse.json({
      success: true,
      categories: fallbackCategories,
      hasDefaultCategories: true,
      totalCategories: fallbackCategories.length,
      dbCategoriesCount: 0,
      defaultCategoriesCount: fallbackCategories.length
    });
  }
}

// Create category (Admin) - Updated with image upload
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const displayOrder = formData.get('displayOrder') as string;
    const isActive = formData.get('isActive') as string === 'true';
    
    // Get image file
    const imageFile = formData.get('image') as File;
    
    // Validate required fields
    if (!name || !imageFile) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      );
    }

    // Validate category name is from allowed values
    const allowedCategories = Object.values(PRODUCT_CATEGORIES);
    if (!allowedCategories.includes(name as typeof allowedCategories[number])) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Allowed values: ${allowedCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }

    // Upload image
    const adminId = session.user._id!;
    let imageUrl = '';
    
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, adminId, 'categories');
    } else {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      name,
      slug,
      description: description || `${name} - Premium quality frames for your memories`,
      image: imageUrl,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      isActive,
      productCount: 0
    });

    return NextResponse.json({
      success: true,
      category
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
}

// Helper function to handle default category updates
async function handleDefaultCategoryUpdate(id: string, updateData: any, adminId: string) {
  // Map default IDs to category names from our DEFAULT_CATEGORIES
  const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === id);
  if (!defaultCat) {
    throw new Error('Default category not found');
  }
  
  const defaultCategoryName = defaultCat.name;
  
  // First, try to find if this default category was already saved to DB
  let existingCategory = await Category.findOne({ originalDefaultId: id });
  
  if (!existingCategory) {
    // If not found, check if a category with the same name exists
    existingCategory = await Category.findOne({ name: defaultCategoryName });
    
    if (!existingCategory) {
      // If still not found, create a new category in DB from the default template
      
      // Handle image upload if provided in updateData
      if (updateData.imageFile) {
        const imageFile = updateData.imageFile;
        delete updateData.imageFile; // Remove the file from update data
        try {
          updateData.image = await uploadImage(imageFile, adminId, 'categories');
        } catch (uploadError) {
          console.error('Error uploading image for default category:', uploadError);
          updateData.image = defaultCat.image;
        }
      } else if (!updateData.image) {
        // Keep the default image if no new image provided
        updateData.image = defaultCat.image;
      }
      
      // Ensure we have required fields
      const categoryData = {
        name: updateData.name || defaultCategoryName,
        slug: updateData.slug || (updateData.name ? 
          updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 
          defaultCat.slug),
        description: updateData.description || defaultCat.description,
        image: updateData.image,
        displayOrder: updateData.displayOrder !== undefined ? updateData.displayOrder : defaultCat.displayOrder,
        isActive: updateData.isActive !== undefined ? updateData.isActive : defaultCat.isActive,
        originalDefaultId: id,
        productCount: 0,
        ...updateData
      };
      
      // Remove any undefined values
      Object.keys(categoryData).forEach(key => {
        if (categoryData[key] === undefined) {
          delete categoryData[key];
        }
      });
      
      // Create a new category in the database
      existingCategory = await Category.create(categoryData);
    } else {
      // Update the existing category with originalDefaultId
      // Don't update the name if it already exists with a different name
      if (updateData.name && updateData.name !== existingCategory.name) {
        delete updateData.name;
      }
      
      existingCategory = await Category.findByIdAndUpdate(
        existingCategory._id,
        { ...updateData, originalDefaultId: id },
        { new: true, runValidators: true }
      );
    }
  } else {
    // Update the existing category
    existingCategory = await Category.findByIdAndUpdate(
      existingCategory._id,
      updateData,
      { new: true, runValidators: true }
    );
  }
  
  return existingCategory;
}

// Update category (Admin) - FIXED: Gets ID from URL params instead of form data
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get ID from URL search params (not form data)
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Update fields
    const updateData: any = {};
    
    const name = formData.get('name') as string;
    if (name) {
      // Validate category name
      const allowedCategories = Object.values(PRODUCT_CATEGORIES);
      if (!allowedCategories.includes(name as typeof allowedCategories[number])) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Allowed values: ${allowedCategories.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.name = name;
    }
    
    const description = formData.get('description') as string;
    if (description !== null) updateData.description = description;
    
    const displayOrder = formData.get('displayOrder') as string;
    if (displayOrder) updateData.displayOrder = parseInt(displayOrder);
    
    const isActive = formData.get('isActive') as string;
    if (isActive !== null) updateData.isActive = isActive === 'true';
    
    // Handle image upload if provided
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const adminId = session.user._id!;
      updateData.image = await uploadImage(imageFile, adminId, 'categories');
      updateData.imageFile = imageFile;
    }

    let updatedCategory;
    
    // Check if it's a MongoDB ObjectId
    if (isValidObjectId(id)) {
      // Handle regular MongoDB document update
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      // Update slug if name changed
      if (name && name !== existingCategory.name) {
        updateData.slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Handle default category (string ID like "default-1")
      // Check if it's a valid default category ID
      const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === id);
      if (!defaultCat) {
        // Also check for numeric IDs (like "1", "2") for backward compatibility
        const numericIdMatch = id.match(/^(\d+)$/);
        if (numericIdMatch) {
          const numericId = numericIdMatch[1];
          const numericToDefault: Record<string, string> = {
            '1': 'default-1',
            '2': 'default-2', 
            '3': 'default-3',
            '4': 'default-4',
            '5': 'default-5',
            '6': 'default-6'
          };
          
          const mappedId = numericToDefault[numericId];
          if (mappedId) {
            const adminId = session.user._id!;
            updatedCategory = await handleDefaultCategoryUpdate(mappedId, updateData, adminId);
          } else {
            return NextResponse.json(
              { success: false, error: 'Invalid default category ID' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid category ID format' },
            { status: 400 }
          );
        }
      } else {
        const adminId = session.user._id!;
        updatedCategory = await handleDefaultCategoryUpdate(id, updateData, adminId);
      }
    }

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: isValidObjectId(id) 
        ? 'Category updated successfully' 
        : 'Default category saved to database successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }
    
    if (error.message === 'Default category not found') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// Helper function to handle default category deletion
async function handleDefaultCategoryDeletion(id: string) {
  const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === id);
  if (!defaultCat) {
    throw new Error('Default category not found');
  }
  
  const defaultCategoryName = defaultCat.name;
  
  // Check if there's already an override in the database
  let categoryOverride = await Category.findOne({ originalDefaultId: id });
  
  if (categoryOverride) {
    // If override exists, mark it as inactive or delete it
    // Check if category has products
    const productCount = await Product.countDocuments({
      category: categoryOverride.name,
      isActive: true
    });
    
    if (productCount > 0) {
      // Can't delete, mark as inactive
      categoryOverride = await Category.findByIdAndUpdate(
        categoryOverride._id,
        { isActive: false },
        { new: true }
      );
      
      return { 
        deleted: true, 
        message: 'Category marked as inactive (has associated products)' 
      };
    } else {
      // Delete the override
      await Category.findByIdAndDelete(categoryOverride._id);
      return { 
        deleted: true, 
        message: 'Category override removed' 
      };
    }
  } else {
    // Check if a category with the same name exists (not necessarily from defaults)
    const existingCategory = await Category.findOne({ name: defaultCategoryName });
    
    if (existingCategory) {
      // Don't modify existing non-default categories
      return { 
        deleted: false, 
        error: 'Cannot delete category that exists independently in database' 
      };
    } else {
      // Create an inactive version to hide ONLY this default category
      await Category.create({
        name: defaultCategoryName,
        slug: defaultCat.slug,
        image: defaultCat.image,
        originalDefaultId: id,
        isActive: false,
        description: 'This category has been disabled',
        displayOrder: defaultCat.displayOrder,
        productCount: 0
      });
      
      return { 
        deleted: true, 
        message: 'Default category disabled (created inactive override)' 
      };
    }
  }
}

// Delete category (Admin) - FIXED: Works with default categories
export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    let result;
    
    // Check if it's a MongoDB ObjectId
    if (isValidObjectId(id)) {
      // Handle regular MongoDB document deletion
      const category = await Category.findById(id);
      
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }

      // Check if category has products
      const productCount = await Product.countDocuments({
        category: category.name,
        isActive: true
      });
      
      if (productCount > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot delete category with ${productCount} associated products. Remove products first or reassign them.` 
          },
          { status: 400 }
        );
      }

      await Category.findByIdAndDelete(id);
      
      result = { 
        deleted: true, 
        message: 'Category deleted successfully' 
      };
    } else {
      // Handle default category (string ID like "default-1")
      // Check if it's a valid default category ID
      const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === id);
      if (!defaultCat) {
        // Also check for numeric IDs (like "1", "2") for backward compatibility
        const numericIdMatch = id.match(/^(\d+)$/);
        if (numericIdMatch) {
          const numericId = numericIdMatch[1];
          const numericToDefault: Record<string, string> = {
            '1': 'default-1',
            '2': 'default-2', 
            '3': 'default-3',
            '4': 'default-4',
            '5': 'default-5',
            '6': 'default-6'
          };
          
          const mappedId = numericToDefault[numericId];
          if (mappedId) {
            result = await handleDefaultCategoryDeletion(mappedId);
          } else {
            return NextResponse.json(
              { success: false, error: 'Invalid default category ID' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid category ID format' },
            { status: 400 }
          );
        }
      } else {
        result = await handleDefaultCategoryDeletion(id);
      }
      
      if (!result.deleted) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to delete default category'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    });
    
  } catch (error: any) {
    console.error('Error deleting category:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID format' },
        { status: 400 }
      );
    }
    
    if (error.message === 'Default category not found') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Image upload utility function
async function uploadImage(image: File, adminId: string, folder: string = 'uploads'): Promise<string> {
  try {
    const buffer = Buffer.from(await image.arrayBuffer());

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", folder, adminId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = image.name.split('.').pop();
    const filename = `${folder}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Save file
    fs.writeFileSync(filepath, buffer);

    // Return URL path
    const publicUrl = `/${folder}/${adminId}/${filename}`;
    
    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image");
  }
}

// Optional: Delete image file function
async function deleteImage(imagePath: string): Promise<void> {
  try {
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const filepath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw error as this shouldn't stop the main operation
  }
}
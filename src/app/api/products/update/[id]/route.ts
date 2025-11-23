import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      basePrice,
      offerPrice,
      description,
      detailedDescription,
      category,
      subCategory,
      material,
      stockQuantity,
      sku,
      sizes,
      styles,
      images,
      featuredImage,
      tags,
      weight,
      deliveryEstimate,
      isAvailable,
      isActive,
      isFeatured,
      imagesToDelete
    } = body;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ 
        success: false,
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Delete old images if specified
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      for (const imageUrl of imagesToDelete) {
        try {
          // Extract filename from URL and delete from file system
          const filename = imageUrl.split('/').pop();
          if (filename) {
            // Get adminId from session or extract from image URL
            const adminId = session.user._id || imageUrl.split('/uploads/')[1]?.split('/')[0];
            if (adminId) {
              const filepath = join(process.cwd(), 'public', 'uploads', adminId, filename);
              if (existsSync(filepath)) {
                await unlink(filepath);
              }
            }
          }
        } catch (err) {
          console.error(`Error deleting file ${imageUrl}:`, err);
        }
      }
    }

    // Update product fields
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
    if (offerPrice !== undefined) updateData.offerPrice = offerPrice ? Number(offerPrice) : null;
    if (description !== undefined) updateData.description = description.trim();
    if (detailedDescription !== undefined) updateData.detailedDescription = detailedDescription?.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (subCategory !== undefined) updateData.subCategory = subCategory?.trim();
    if (material !== undefined) updateData.material = material.trim();
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity);
    if (sku !== undefined) updateData.sku = sku.trim().toUpperCase();
    if (sizes !== undefined) updateData.sizes = sizes;
    if (styles !== undefined) updateData.styles = styles;
    if (images !== undefined) updateData.images = images;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (tags !== undefined) updateData.tags = tags;
    if (weight !== undefined) updateData.weight = weight ? Number(weight) : null;
    if (deliveryEstimate !== undefined) updateData.deliveryEstimate = deliveryEstimate;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    // Check SKU uniqueness if SKU is being updated
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct && existingProduct._id.toString() !== id) {
        return NextResponse.json({
          success: false,
          error: 'Product with this SKU already exists'
        }, { status: 400 });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: errors
      }, { status: 400 });
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: 'Product with this SKU or title already exists'
      }, { status: 400 });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update product',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
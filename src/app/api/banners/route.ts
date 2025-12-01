import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// /api/banners/route.ts

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const type = searchParams.get('type') || 'hero';
    const limit = searchParams.get('limit') || '10';
    
    // Build query
    const query: any = { type };
    
    if (activeOnly) {
      query.isActive = true;
      
      // Check date validity
      const now = new Date();
      query.$or = [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        {
          $and: [
            { startDate: { $lte: now } },
            { endDate: { $gte: now } }
          ]
        },
        {
          startDate: { $lte: now },
          endDate: { $exists: false }
        },
        {
          startDate: { $exists: false },
          endDate: { $gte: now }
        }
      ];
    }
    
    const banners = await Banner.find(query)
      .sort({ displayOrder: 1 })
      .limit(parseInt(limit))
      .lean();
    
    // If banners exist in DB, use them
    if (banners.length > 0) {
      return NextResponse.json({
        success: true,
        banners: banners.map(banner => ({
          ...banner,
          _id: banner._id.toString() // Convert ObjectId to string
        }))
      });
    }
    
    // Default banners if none in DB
    const defaultBanners = [
      {
        _id: '1',
        title: 'Frame Your Perfect Moments',
        subtitle: 'Premium quality frames for every memory',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&h=900&fit=crop&q=80',
        link: '/products',
        linkText: 'Shop Now',
        displayOrder: 1,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: '20% Off Custom Frames',
        subtitle: 'Use code FRAME20 at checkout',
        image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=1920&h=900&fit=crop&q=80',
        link: '/products?discount=true',
        linkText: 'Shop Now',
        displayOrder: 2,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'New Arrivals Collection',
        subtitle: 'Explore the latest frame designs',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=900&fit=crop&q=80',
        link: '/products?sortBy=newest',
        linkText: 'Explore Now',
        displayOrder: 3,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      success: true,
      banners: defaultBanners
    });
    
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    
    // Fallback banners
    const fallbackBanners = [
      {
        _id: '1',
        title: 'Frame Your Perfect Moments',
        subtitle: 'Premium quality frames for every memory',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&h=900&fit=crop&q=80',
        link: '/products',
        linkText: 'Shop Now',
        displayOrder: 1,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: '20% Off Custom Frames',
        subtitle: 'Use code FRAME20 at checkout',
        image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=1920&h=900&fit=crop&q=80',
        link: '/products?discount=true',
        linkText: 'Shop Now',
        displayOrder: 2,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'New Arrivals Collection',
        subtitle: 'Explore the latest frame designs',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=900&fit=crop&q=80',
        link: '/products?sortBy=newest',
        linkText: 'Explore Now',
        displayOrder: 3,
        isActive: true,
        type: 'hero',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({
      success: true,
      banners: fallbackBanners
    });
  }
}

// Create banner (Admin) - Updated with image upload
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
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const link = formData.get('link') as string;
    const linkText = formData.get('linkText') as string || 'Shop Now';
    const displayOrder = formData.get('displayOrder') as string;
    const type = formData.get('type') as string || 'hero';
    const isActive = formData.get('isActive') as string === 'true';
    
    // Get image file
    const imageFile = formData.get('image') as File;
    
    // Validate required fields
    if (!title || !imageFile) {
      return NextResponse.json(
        { success: false, error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Upload image
    const adminId = session.user._id!;
    let imageUrl = '';
    
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, adminId, 'banners');
    } else {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Create banner
    const banner = await Banner.create({
      title,
      subtitle,
      image: imageUrl,
      link,
      linkText,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      type,
      isActive,
    });

    return NextResponse.json({
      success: true,
      banner: {
        ...banner.toObject(),
        _id: banner._id.toString()
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating banner:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Banner with similar properties already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
}

// Helper function to handle default banner updates
async function handleDefaultBannerUpdate(id: string, updateData: any) {
  // For default banners (string IDs like "1", "2", "3")
  // We need to check if they already exist in the database
  
  // First, try to find if this default banner was already saved to DB
  let existingBanner = await Banner.findOne({ originalDefaultId: id });
  
  if (!existingBanner) {
    // If not found, create a new banner in DB from the default template
    // Map the default ID to a banner template
    const defaultBanners: Record<string, any> = {
      '1': {
        title: 'Frame Your Perfect Moments',
        subtitle: 'Premium quality frames for every memory',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&h=900&fit=crop&q=80',
        link: '/products',
        linkText: 'Shop Now',
        displayOrder: 1,
        isActive: true,
        type: 'hero',
      },
      '2': {
        title: '20% Off Custom Frames',
        subtitle: 'Use code FRAME20 at checkout',
        image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=1920&h=900&fit=crop&q=80',
        link: '/products?discount=true',
        linkText: 'Shop Now',
        displayOrder: 2,
        isActive: true,
        type: 'hero',
      },
      '3': {
        title: 'New Arrivals Collection',
        subtitle: 'Explore the latest frame designs',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=900&fit=crop&q=80',
        link: '/products?sortBy=newest',
        linkText: 'Explore Now',
        displayOrder: 3,
        isActive: true,
        type: 'hero',
      }
    };
    
    const defaultTemplate = defaultBanners[id] || {
      title: 'New Banner',
      subtitle: 'Banner subtitle',
      image: '',
      link: '/',
      linkText: 'Learn More',
      displayOrder: parseInt(id) || 0,
      isActive: true,
      type: 'hero',
    };
    
    // Create a new banner in the database
    existingBanner = await Banner.create({
      ...defaultTemplate,
      originalDefaultId: id, // Store the original default ID for reference
      ...updateData // Apply any updates from the request
    });
  } else {
    // Update the existing banner
    existingBanner = await Banner.findByIdAndUpdate(
      existingBanner._id,
      updateData,
      { new: true, runValidators: true }
    );
  }
  
  return existingBanner;
}

// Update banner (Admin) - UPDATED: Now handles default banners by converting them to DB entries
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

    // Get ID from URL parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Update fields
    const updateData: any = {};
    
    const title = formData.get('title') as string;
    if (title) updateData.title = title;
    
    const subtitle = formData.get('subtitle') as string;
    if (subtitle !== null) updateData.subtitle = subtitle;
    
    const link = formData.get('link') as string;
    if (link !== null) updateData.link = link;
    
    const linkText = formData.get('linkText') as string;
    if (linkText) updateData.linkText = linkText;
    
    const displayOrder = formData.get('displayOrder') as string;
    if (displayOrder) updateData.displayOrder = parseInt(displayOrder);
    
    const type = formData.get('type') as string;
    if (type) updateData.type = type;
    
    const isActive = formData.get('isActive') as string;
    if (isActive !== null) updateData.isActive = isActive === 'true';
    
    // Handle image upload if provided
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const adminId = session.user._id!;
      updateData.image = await uploadImage(imageFile, adminId, 'banners');
    }

    let updatedBanner;
    
    // Check if it's a MongoDB ObjectId
    if (isValidObjectId(id)) {
      // Handle regular MongoDB document update
      const existingBanner = await Banner.findById(id);
      if (!existingBanner) {
        return NextResponse.json(
          { success: false, error: 'Banner not found' },
          { status: 404 }
        );
      }
      
      updatedBanner = await Banner.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      // Handle default banner (string ID like "1", "2", "3")
      updatedBanner = await handleDefaultBannerUpdate(id, updateData);
    }

    return NextResponse.json({
      success: true,
      banner: {
        ...updatedBanner!.toObject(),
        _id: updatedBanner!._id.toString()
      },
      message: isValidObjectId(id) ? 'Banner updated successfully' : 'Default banner saved to database successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating banner:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// Helper function to handle default banner deletion
async function handleDefaultBannerDeletion(id: string) {
  // For default banners, we can't "delete" them from the default list,
  // but we can create an inactive version in the database to override them
  
  // Check if there's already an override in the database
  let bannerOverride = await Banner.findOne({ originalDefaultId: id });
  
  if (bannerOverride) {
    // If override exists, mark it as inactive or delete it
    await Banner.findByIdAndDelete(bannerOverride._id);
    return { deleted: true, message: 'Banner override removed' };
  } else {
    // Create an inactive version to hide the default banner
    const defaultBanners: Record<string, any> = {
      '1': {
        title: 'Frame Your Perfect Moments',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1920&h=900&fit=crop&q=80',
      },
      '2': {
        title: '20% Off Custom Frames',
        image: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=1920&h=900&fit=crop&q=80',
      },
      '3': {
        title: 'New Arrivals Collection',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&h=900&fit=crop&q=80',
      }
    };
    
    const defaultTemplate = defaultBanners[id] || {
      title: 'Default Banner',
      image: '',
    };
    
    await Banner.create({
      ...defaultTemplate,
      originalDefaultId: id,
      isActive: false, // Mark as inactive to hide it
      subtitle: 'This banner has been disabled',
      link: '#',
      linkText: 'Disabled',
      displayOrder: parseInt(id) || 0,
      type: 'hero',
    });
    
    return { deleted: true, message: 'Default banner disabled (created inactive override)' };
  }
}

// Delete banner (Admin) - UPDATED: Now handles default banners by creating inactive overrides
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
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    let result;
    
    // Check if it's a MongoDB ObjectId
    if (isValidObjectId(id)) {
      // Handle regular MongoDB document deletion
      const banner = await Banner.findByIdAndDelete(id);
      
      if (!banner) {
        return NextResponse.json(
          { success: false, error: 'Banner not found' },
          { status: 404 }
        );
      }
      
      result = { 
        deleted: true, 
        message: 'Banner deleted successfully' 
      };
    } else {
      // Handle default banner (string ID like "1", "2", "3")
      result = await handleDefaultBannerDeletion(id);
    }

    // Optional: Delete associated image file for database banners
    // if (isValidObjectId(id)) {
    //   await deleteImage(banner.image);
    // }

    return NextResponse.json({
      success: true,
      ...result
    });
    
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
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
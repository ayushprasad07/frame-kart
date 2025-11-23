import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// /api/products/route.ts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const material = searchParams.get('material');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true

    // Build query
    const query: any = { isActive };

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Material filter
    if (material) {
      query.material = { $regex: material, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort configuration
    const sortOptions: any = {};
    switch (sortBy) {
      case 'price':
        sortOptions.basePrice = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortOptions.title = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'featured':
        sortOptions.isFeatured = -1;
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .select('-__v') // Exclude version key
      .lean(); // Convert to plain JavaScript objects for better performance

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Get unique categories and materials for filters
    const categories = await Product.distinct('category', { isActive });
    const materials = await Product.distinct('material', { isActive });

    // Calculate price range for filter options
    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$basePrice' },
          maxPrice: { $max: '$basePrice' }
        }
      }
    ]);

    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 10000 };

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        categories: categories.sort(),
        materials: materials.sort(),
        priceRange: {
          min: priceRange.minPrice,
          max: priceRange.maxPrice
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
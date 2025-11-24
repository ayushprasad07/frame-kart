// /api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    const categories = await Product.aggregate([
      { 
        $match: { 
          isActive: true,
          isAvailable: true 
        } 
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          image: { $first: '$featuredImage' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          image: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories'
      },
      { status: 500 }
    );
  }
}
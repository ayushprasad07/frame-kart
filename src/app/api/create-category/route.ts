import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { PRODUCT_CATEGORIES } from '@/models/Product';



export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      );
    }
    
    // Generate slug from name if not provided
    if (!body.slug) {
      body.slug = body.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name: body.name }, { slug: body.slug }]
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name or slug already exists' },
        { status: 400 }
      );
    }
    
    const category = await Category.create(body);
    
    return NextResponse.json({
      success: true,
      category
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
// //api/products/delete/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';


export async function DELETE(
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

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ 
        success: false,
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Option 1: Soft delete (recommended)
    product.isActive = false;
    product.isAvailable = false;
    await product.save();

    // Option 2: Hard delete (uncomment if you want to permanently delete)
    /*
    // Delete associated images from file system
    for (const imageUrl of product.images) {
      try {
        const filename = imageUrl.split('/').pop();
        if (filename) {
          const adminId = session.user.id || imageUrl.split('/uploads/')[1]?.split('/')[0];
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
    await Product.findByIdAndDelete(id);
    */

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete product',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
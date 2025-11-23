import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    await connectDB();
    const { orderNumber } = await params;

    const order = await Order.findOne({ orderNumber })
      .populate('items.productId', 'title images')
      .select('-customer.email -customer.phone'); // Exclude sensitive info for public tracking

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        expectedDelivery: order.expectedDelivery,
        items: order.items,
        totalAmount: order.totalAmount,
        shiprocket: order.shiprocket,
        customer: {
          name: order.customer.name,
          address: {
            city: order.customer.address.city,
            state: order.customer.address.state
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
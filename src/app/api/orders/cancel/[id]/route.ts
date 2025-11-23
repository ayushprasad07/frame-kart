import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { email, phone, reason } = body;

    // Validate that either email or phone is provided
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone is required to cancel order' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership using email or phone
    const isOwner = (email && order.customer.email === email.toLowerCase()) || 
                   (phone && order.customer.phone === phone);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this order' },
        { status: 403 }
      );
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled at this stage' },
        { status: 400 }
      );
    }

    // Update order status
    order.status = 'cancelled';
    order.adminNotes = reason ? `Cancelled by customer: ${reason}` : 'Order cancelled by customer';
    
    if (order.payment.status === 'paid') {
      order.payment.status = 'refunded';
      // TODO: Initiate refund process
    }

    await order.save();

    // TODO: Send cancellation notification

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
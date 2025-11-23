// POST create new order
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';


export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      customer,
      items,
      subtotal,
      shippingCharges,
      taxAmount,
      discountAmount,
      totalAmount,
      payment,
      shippingMethod = 'Standard',
      customerNotes
    } = body;

    // Validate required fields
    if (!customer || !items || !payment || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Create new order
    const newOrder = new Order({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
        address: {
          street: customer.address.street.trim(),
          city: customer.address.city.trim(),
          state: customer.address.state.trim(),
          pincode: customer.address.pincode.trim(),
          country: customer.address.country?.trim() || 'India',
          landmark: customer.address.landmark?.trim()
        }
      },
      items: items.map((item: any) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size,
        style: item.style,
        sku: item.sku
      })),
      subtotal: Number(subtotal),
      shippingCharges: Number(shippingCharges),
      taxAmount: Number(taxAmount),
      discountAmount: Number(discountAmount || 0),
      totalAmount: Number(totalAmount),
      payment: {
        method: payment.method,
        status: payment.status || 'pending',
        transactionId: payment.transactionId,
        amount: Number(totalAmount),
        currency: 'INR'
      },
      shippingMethod,
      customerNotes,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // TODO: Integrate with Shiprocket API here
    // await createShiprocketOrder(savedOrder);

    // TODO: Send WhatsApp notification
    // await sendOrderConfirmationWhatsApp(savedOrder);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
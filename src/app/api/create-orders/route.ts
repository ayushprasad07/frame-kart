// // POST create new order
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Order from '@/models/Order';


// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();
    
//     const body = await request.json();
//     const {
//       customer,
//       items,
//       subtotal,
//       shippingCharges,
//       taxAmount,
//       discountAmount,
//       totalAmount,
//       payment,
//       shippingMethod = 'Standard',
//       customerNotes
//     } = body;

//     // Validate required fields
//     if (!customer || !items || !payment || !totalAmount) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Generate order number
//     const orderNumber = await Order.generateOrderNumber();

//     // Create new order
//     const newOrder = new Order({
//       orderNumber,
//       customer: {
//         name: customer.name.trim(),
//         email: customer.email.toLowerCase().trim(),
//         phone: customer.phone.trim(),
//         address: {
//           street: customer.address.street.trim(),
//           city: customer.address.city.trim(),
//           state: customer.address.state.trim(),
//           pincode: customer.address.pincode.trim(),
//           country: customer.address.country?.trim() || 'India',
//           landmark: customer.address.landmark?.trim()
//         }
//       },
//       items: items.map((item: any) => ({
//         productId: item.productId,
//         title: item.title,
//         price: item.price,
//         quantity: item.quantity,
//         image: item.image,
//         size: item.size,
//         style: item.style,
//         sku: item.sku
//       })),
//       subtotal: Number(subtotal),
//       shippingCharges: Number(shippingCharges),
//       taxAmount: Number(taxAmount),
//       discountAmount: Number(discountAmount || 0),
//       totalAmount: Number(totalAmount),
//       payment: {
//         method: payment.method,
//         status: payment.status || 'pending',
//         transactionId: payment.transactionId,
//         amount: Number(totalAmount),
//         currency: 'INR'
//       },
//       shippingMethod,
//       customerNotes,
//       status: 'pending'
//     });

//     const savedOrder = await newOrder.save();

//     // TODO: Integrate with Shiprocket API here
//     // await createShiprocketOrder(savedOrder);

//     // TODO: Send WhatsApp notification
//     // await sendOrderConfirmationWhatsApp(savedOrder);

//     return NextResponse.json({
//       success: true,
//       message: 'Order created successfully',
//       order: savedOrder
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error('Error creating order:', error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map((err: any) => err.message);
//       return NextResponse.json(
//         { error: 'Validation failed', details: errors },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Failed to create order' },
//       { status: 500 }
//     );
//   }
// }




// POST create new order
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Shiprocket API configuration
const SHIPROCKET_CONFIG = {
  baseUrl: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD
};

// WhatsApp API configuration (using WhatsApp Business API or alternative service)
const WHATSAPP_CONFIG = {
  baseUrl: process.env.WHATSAPP_BASE_URL,
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
};

// Helper function to authenticate with Shiprocket
async function getShiprocketToken() {
  try {
    const response = await fetch(`${SHIPROCKET_CONFIG.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: SHIPROCKET_CONFIG.email,
        password: SHIPROCKET_CONFIG.password
      })
    });

    if (!response.ok) {
      throw new Error(`Shiprocket auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
    throw error;
  }
}

// Function to create Shiprocket order
async function createShiprocketOrder(order: any) {
  try {
    const token = await getShiprocketToken();

    const shiprocketOrder = {
      order_id: order.orderNumber,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary', // Your pickup location name
      channel_id: '', // Your sales channel ID if any
      comment: order.customerNotes || '',
      billing_customer_name: order.customer.name,
      billing_last_name: '',
      billing_address: order.customer.address.street,
      billing_address_2: order.customer.address.landmark || '',
      billing_city: order.customer.address.city,
      billing_pincode: order.customer.address.pincode,
      billing_state: order.customer.address.state,
      billing_country: order.customer.address.country,
      billing_email: order.customer.email,
      billing_phone: order.customer.phone,
      shipping_is_billing: true,
      shipping_customer_name: order.customer.name,
      shipping_last_name: '',
      shipping_address: order.customer.address.street,
      shipping_address_2: order.customer.address.landmark || '',
      shipping_city: order.customer.address.city,
      shipping_pincode: order.customer.address.pincode,
      shipping_state: order.customer.address.state,
      shipping_country: order.customer.address.country,
      shipping_email: order.customer.email,
      shipping_phone: order.customer.phone,
      order_items: order.items.map((item: any) => ({
        name: item.title,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price,
        discount: '',
        tax: '',
        hsn: '' // HSN code if available
      })),
      payment_method: order.payment.method === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: order.shippingCharges,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discountAmount,
      sub_total: order.subtotal,
      length: 10, // Product dimensions in cm
      breadth: 10,
      height: 10,
      weight: 0.5 // Weight in kg
    };

    const response = await fetch(`${SHIPROCKET_CONFIG.baseUrl}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketOrder)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Shiprocket order creation failed: ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    
    // Update order with Shiprocket data
    await Order.findByIdAndUpdate(order._id, {
      'shipment.shiprocketOrderId': data.order_id,
      'shipment.shipmentId': data.shipment_id,
      'shipment.awbCode': data.awb_code,
      'shipment.status': data.status
    });

    return data;
  } catch (error) {
    console.error('Shiprocket order creation error:', error);
    throw error;
  }
}

// Function to send WhatsApp notification
async function sendOrderConfirmationWhatsApp(order: any) {
  try {
    // Format order items for message
    const itemsList = order.items.map((item: any) => 
      `• ${item.title} (${item.size}) - ${item.quantity} x ₹${item.price}`
    ).join('\n');

    const message = `
🎉 *Order Confirmed!*

Thank you for your purchase, ${order.customer.name}!

*Order Details:*
📦 Order #: ${order.orderNumber}
📅 Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}

*Items:*
${itemsList}

*Price Breakdown:*
Subtotal: ₹${order.subtotal}
Shipping: ₹${order.shippingCharges}
Tax: ₹${order.taxAmount}
${order.discountAmount > 0 ? `Discount: -₹${order.discountAmount}\n` : ''}
*Total: ₹${order.totalAmount}*

*Shipping Address:*
${order.customer.address.street}
${order.customer.address.city}, ${order.customer.address.state} - ${order.customer.address.pincode}
${order.customer.address.country}

*Payment Method:* ${order.payment.method.toUpperCase()}
*Status:* ${order.status}

We'll notify you when your order ships! Track your order here: https://yourapp.com/track/${order.orderNumber}

For any queries, contact us at +91-XXXXXXXXXX
    `.trim();

    // Using WhatsApp Business API
    if (WHATSAPP_CONFIG.baseUrl && WHATSAPP_CONFIG.token && WHATSAPP_CONFIG.phoneNumberId) {
      const response = await fetch(
        `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: order.customer.phone.replace('+', ''),
            type: 'text',
            text: { body: message }
          })
        }
      );

      if (!response.ok) {
        console.warn('WhatsApp notification failed:', await response.text());
        // Don't throw error for WhatsApp failures as order is already created
      } else {
        console.log('WhatsApp notification sent successfully');
      }
    } else {
      // Fallback: Log message or use alternative WhatsApp service
      console.log('WhatsApp Message (configure credentials to send):', message);
      
      // Alternative: Use Twilio WhatsApp API
      await sendWhatsAppViaTwilio(order.customer.phone, message);
    }

  } catch (error) {
    console.error('WhatsApp notification error:', error);
    // Don't throw error to avoid affecting order creation
  }
}

// Alternative WhatsApp function using Twilio
async function sendWhatsAppViaTwilio(phone: string, message: string) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_WHATSAPP_PHONE;

    if (!accountSid || !authToken || !twilioPhone) {
      return;
    }

    // Twilio client would be imported, but for simplicity using fetch
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioPhone}`,
          To: `whatsapp:${phone}`,
          Body: message
        })
      }
    );

    if (!response.ok) {
      console.warn('Twilio WhatsApp failed:', await response.text());
    }
  } catch (error) {
    console.error('Twilio WhatsApp error:', error);
  }
}

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

    // Validate customer address
    if (!customer.address || !customer.address.street || !customer.address.city || 
        !customer.address.state || !customer.address.pincode) {
      return NextResponse.json(
        { error: 'Invalid customer address' },
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

    // Integrate with Shiprocket API
    try {
      await createShiprocketOrder(savedOrder);
      console.log('Shiprocket order created successfully');
    } catch (shiprocketError) {
      console.error('Shiprocket integration failed:', shiprocketError);
      // Continue with order creation even if Shiprocket fails
    }

    // Send WhatsApp notification (non-blocking)
    sendOrderConfirmationWhatsApp(savedOrder).catch(error => {
      console.error('WhatsApp notification failed:', error);
    });

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
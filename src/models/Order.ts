import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string; // Added for frame sizes
  style?: string; // Added for frame styles
  sku: string; // Added for Shiprocket
}

export interface ICustomerAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

export interface ICustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: ICustomerAddress;
}

export interface IShiprocketDetails {
  orderId?: string; // Shiprocket order ID
  shipmentId?: string;
  awbCode?: string; // Air Waybill number
  channel?: string; // Order source
  labelUrl?: string; // Shipping label URL
  manifestUrl?: string; // Manifest URL
  pickupToken?: string;
  status?: string; // Shiprocket order status
}

export interface IPaymentDetails {
  method: 'COD' | 'Prepaid';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  amount: number;
  currency: string;
}

export interface IOrder extends Document {
  // Order Identification
  orderNumber: string; // Human-readable order number
  
  // Customer Information
  customer: ICustomerDetails;
  
  // Order Items
  items: IOrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Order Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  
  // Payment Information
  payment: IPaymentDetails;
  
  // Shiprocket Integration
  shiprocket: IShiprocketDetails;
  
  // Shipping Information
  shippingMethod: string;
  expectedDelivery?: Date;
  
  // Admin Notes
  adminNotes?: string;
  customerNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface OrderModel extends Model<IOrder> {
  generateOrderNumber(): Promise<string>;
}

const OrderItemSchema: Schema = new Schema<IOrderItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  image: { 
    type: String 
  },
  size: {
    type: String,
    trim: true
  },
  style: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  }
});

const CustomerAddressSchema: Schema = new Schema<ICustomerAddress>({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'India',
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  }
});

const CustomerDetailsSchema: Schema = new Schema<ICustomerDetails>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: CustomerAddressSchema,
    required: true
  }
});

const ShiprocketDetailsSchema: Schema = new Schema<IShiprocketDetails>({
  orderId: {
    type: String,
    trim: true
  },
  shipmentId: {
    type: String,
    trim: true
  },
  awbCode: {
    type: String,
    trim: true
  },
  channel: {
    type: String,
    default: 'Website',
    trim: true
  },
  labelUrl: {
    type: String,
    trim: true
  },
  manifestUrl: {
    type: String,
    trim: true
  },
  pickupToken: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true
  }
});

const PaymentDetailsSchema: Schema = new Schema<IPaymentDetails>({
  method: {
    type: String,
    enum: ['COD', 'Prepaid'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  }
});

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customer: {
      type: CustomerDetailsSchema,
      required: true
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCharges: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending'
    },
    payment: {
      type: PaymentDetailsSchema,
      required: true
    },
    shiprocket: {
      type: ShiprocketDetailsSchema,
      default: {}
    },
    shippingMethod: {
      type: String,
      default: 'Standard',
      trim: true
    },
    expectedDelivery: {
      type: Date
    },
    adminNotes: {
      type: String,
      trim: true
    },
    customerNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Add this static method instead of using pre-save middleware
OrderSchema.statics.generateOrderNumber = async function(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const latestOrder = await this.findOne({
    orderNumber: new RegExp(`^ORD-${year}${month}${day}`)
  }).sort({ createdAt: -1 });
  
  let sequence = 1;
  if (latestOrder) {
    const lastSequence = parseInt(latestOrder.orderNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `ORD-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
};

// Then when creating an order, manually set the orderNumber:
// const orderNumber = await Order.generateOrderNumber();
// const order = new Order({ orderNumber, ...otherData });

// Indexes for better query performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'shiprocket.orderId': 1 });

const Order: OrderModel = (mongoose.models.Order as OrderModel) || mongoose.model<IOrder, OrderModel>('Order', OrderSchema);

export default Order;
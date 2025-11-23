// cart.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  productId: Schema.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  style: string;
  sku: string;
}

export interface ICart extends Document {
  sessionId: string; // For guest users
  userId?: Schema.Types.ObjectId; // For logged-in users
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema: Schema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  size: { type: String, required: true },
  style: { type: String, required: true },
  sku: { type: String, required: true }
});

const CartSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    items: [CartItemSchema],
    total: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
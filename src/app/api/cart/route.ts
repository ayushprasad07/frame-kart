// pages/api/cart/add.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Cart from '../../../models/Cart';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { sessionId, item } = req.body;
      
      let cart = await Cart.findOne({ sessionId });
      
      if (!cart) {
        // Create new cart
        cart = new Cart({ 
          sessionId, 
          items: [item],
          total: item.price * item.quantity
        });
      } else {
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (cartItem: any) => 
            cartItem.productId.toString() === item.productId &&
            cartItem.size === item.size &&
            cartItem.style === item.style
        );
        
        if (existingItemIndex > -1) {
          // Update quantity if item exists
          cart.items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          cart.items.push(item);
        }
        
        // Recalculate total
        cart.total = cart.items.reduce((sum: number, cartItem: any) => 
          sum + (cartItem.price * cartItem.quantity), 0
        );
      }
      
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }
}
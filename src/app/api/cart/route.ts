// /api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Cart from '../../../models/Cart';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, item } = await request.json();
    
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
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// Add GET method to fetch cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    const cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }
    
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add DELETE method to clear cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    await Cart.findOneAndDelete({ sessionId });
    
    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
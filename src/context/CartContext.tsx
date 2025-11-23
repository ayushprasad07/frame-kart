// 'use client';

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// export interface CartItem {
//   productId: string;
//   title: string;
//   price: number;
//   quantity: number;
//   image?: string;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   addToCart: (item: Omit<CartItem, 'quantity'>) => void;
//   removeFromCart: (productId: string) => void;
//   updateQuantity: (productId: string, quantity: number) => void;
//   clearCart: () => void;
//   getTotal: () => number;
//   getItemCount: () => number;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({ children }: { children: ReactNode }) {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   // Load cart from localStorage on mount
//   useEffect(() => {
//     const savedCart = localStorage.getItem('framekart-cart');
//     if (savedCart) {
//       try {
//         setCartItems(JSON.parse(savedCart));
//       } catch (error) {
//         console.error('Error loading cart from localStorage:', error);
//       }
//     }
//   }, []);

//   // Save cart to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('framekart-cart', JSON.stringify(cartItems));
//   }, [cartItems]);

//   const addToCart = (item: Omit<CartItem, 'quantity'>) => {
//     setCartItems((prev) => {
//       const existingItem = prev.find((i) => i.productId === item.productId);
//       if (existingItem) {
//         return prev.map((i) =>
//           i.productId === item.productId
//             ? { ...i, quantity: i.quantity + 1 }
//             : i
//         );
//       }
//       return [...prev, { ...item, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (productId: string) => {
//     setCartItems((prev) => prev.filter((item) => item.productId !== productId));
//   };

//   const updateQuantity = (productId: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.productId === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const getTotal = () => {
//     return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   };

//   const getItemCount = () => {
//     return cartItems.reduce((sum, item) => sum + item.quantity, 0);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//         getTotal,
//         getItemCount,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (context === undefined) {
//     throw new Error('useCart must be used within a CartProvider');
//   }
//   return context;
// }


import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); setCartCount(0); return; }
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    if (data) {
      setCartItems(data);
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistItems([]); return; }
    const { data } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', user.id);
    if (data) setWishlistItems(data);
  }, [user]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) return false;
    const existing = cartItems.find(item => item.product_id === product.id);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity
      });
    }
    await fetchCart();
    return true;
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId);
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await fetchCart();
  };

  const toggleWishlist = async (productId) => {
    if (!user) return;
    const existing = wishlistItems.find(item => item.product_id === productId);
    if (existing) {
      await supabase.from('wishlist').delete().eq('id', existing.id);
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
    }
    await fetchWishlist();
  };

  const isInWishlist = (productId) => wishlistItems.some(item => item.product_id === productId);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const cartDiscount = cartItems.reduce((sum, item) => {
    const orig = item.products?.original_price || item.products?.price || 0;
    return sum + (orig - (item.products?.price || 0)) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, wishlistItems, cartCount,
      addToCart, updateQuantity, removeFromCart, clearCart,
      toggleWishlist, isInWishlist,
      cartTotal, cartDiscount,
      fetchCart, fetchWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

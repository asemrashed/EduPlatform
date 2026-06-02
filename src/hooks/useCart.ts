'use client';

import { useCallback, useMemo } from 'react';
import {
  addToCart as addToCartAction,
  clearCart as clearCartAction,
  removeFromCart as removeFromCartAction,
  setLineQuantity,
  useAppDispatch,
  useAppSelector,
} from '@/store';

export interface CartItem {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  price: number;
  quantity: number;
  lectures?: number;
  instructor?: {
    _id: string;
    name: string;
  };
}

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const isLoaded = useAppSelector((s) => s.cart.isLoaded);

  const cartItems: CartItem[] = useMemo(
    () =>
      items.map((line) => ({
        _id: line.courseId,
        title: line.title,
        price: line.finalPrice,
        quantity: line.quantity,
      })),
    [items],
  );

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'>) => {
      dispatch(
        addToCartAction({
          courseId: item._id,
          title: item.title,
          finalPrice: item.price,
          isPaid: item.price > 0,
        }),
      );
    },
    [dispatch],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      dispatch(removeFromCartAction(id));
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(setLineQuantity({ courseId: id, quantity }));
    },
    [dispatch],
  );

  const clearCart = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const getCartTotal = useCallback(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const getCartItemCount = useCallback(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const isInCart = useCallback(
    (id: string) => items.some((line) => line.courseId === id),
    [items],
  );

  return {
    cartItems,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
  };
}

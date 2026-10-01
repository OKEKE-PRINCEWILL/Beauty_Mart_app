"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth-provider";
import {
  addCartItem,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "@/lib/api/cart";

const emptyCart: Cart = { items: [], totalItems: 0, subtotal: 0 };

type CartContextValue = {
  cart: Cart;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!user || !token) {
      return () => {
        active = false;
      };
    }

    void getCart(token)
      .then((nextCart) => {
        if (active) {
          setCart(nextCart);
          setLoadedUserId(user.id);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(errorMessage(requestError));
          setCart(emptyCart);
          setLoadedUserId(user.id);
        }
      });

    return () => {
      active = false;
    };
  }, [token, user]);

  const mutate = useCallback(
    async (request: (activeToken: string) => Promise<Cart>) => {
      if (!token) {
        throw new Error("Sign in to manage your cart");
      }
      setMutating(true);
      setError(null);
      try {
        setCart(await request(token));
      } catch (requestError) {
        const message = errorMessage(requestError);
        setError(message);
        throw new Error(message);
      } finally {
        setMutating(false);
      }
    },
    [token]
  );

  const addItem = useCallback(
    (productId: number, quantity = 1) =>
      mutate((activeToken) => addCartItem(activeToken, productId, quantity)),
    [mutate]
  );
  const updateItem = useCallback(
    (cartItemId: number, quantity: number) =>
      mutate((activeToken) => updateCartItem(activeToken, cartItemId, quantity)),
    [mutate]
  );
  const removeItem = useCallback(
    (cartItemId: number) =>
      mutate((activeToken) => removeCartItem(activeToken, cartItemId)),
    [mutate]
  );
  const clearCart = useCallback(
    () => mutate((activeToken) => clearCartRequest(activeToken)),
    [mutate]
  );
  const refreshCart = useCallback(async () => {
    if (!token || !user) return;
    setError(null);
    try {
      setCart(await getCart(token));
      setLoadedUserId(user.id);
    } catch (requestError) {
      const message = errorMessage(requestError);
      setError(message);
      throw new Error(message);
    }
  }, [token, user]);

  const visibleCart = user && token && loadedUserId === user.id ? cart : emptyCart;
  const loading = authLoading || Boolean(user && token && loadedUserId !== user.id);
  const visibleError = user && token ? error : null;

  const value = useMemo(
    () => ({
      cart: visibleCart,
      loading,
      mutating,
      error: visibleError,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      refreshCart,
    }),
    [visibleCart, loading, mutating, visibleError, addItem, updateItem, removeItem, clearCart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The cart could not be updated";
}

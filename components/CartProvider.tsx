"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type CartItem = {
  productId: number;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  totalItems: number;
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isHydrated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mengambil data keranjang dari localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("safeclimate-cart");

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is CartItem =>
              typeof item === "object" &&
              item !== null &&
              "productId" in item &&
              "quantity" in item &&
              typeof item.productId === "number" &&
              Number.isInteger(item.productId) &&
              typeof item.quantity === "number" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          );

          setCartItems(validItems);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }

    setIsHydrated(true);
  }, []);

  // Menyimpan perubahan keranjang ke localStorage
  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem("safeclimate-cart", JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  // Menambahkan produk ke keranjang
  const addToCart = (productId: number, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === productId);

      if (existingItem) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...current, { productId, quantity }];
    });
  };

  // Menghapus produk dari keranjang
  const removeFromCart = (productId: number) => {
    setCartItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  // Mengubah jumlah produk
  const updateQuantity = (productId: number, quantity: number) => {
    if (!Number.isInteger(quantity)) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  // Mengosongkan seluruh keranjang
  const clearCart = () => {
    setCartItems([]);
  };

  // Menghitung jumlah seluruh item
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook untuk mengakses Cart
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

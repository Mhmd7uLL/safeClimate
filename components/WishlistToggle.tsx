"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type WishlistContextType = {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  removeWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  isHydrated: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mengambil wishlist dari localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("safeclimate-wishlist");

      if (savedWishlist) {
        const parsed: unknown = JSON.parse(savedWishlist);

        if (Array.isArray(parsed)) {
          setWishlistIds(
            parsed.filter(
              (id): id is number =>
                typeof id === "number" && Number.isInteger(id),
            ),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }

    setIsHydrated(true);
  }, []);

  // Menyimpan wishlist ke localStorage
  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem("safeclimate-wishlist", JSON.stringify(wishlistIds));
  }, [wishlistIds, isHydrated]);

  // Menambah atau menghapus produk favorit
  const toggleWishlist = (productId: number) => {
    setWishlistIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  // Menghapus produk dari wishlist
  const removeWishlist = (productId: number) => {
    setWishlistIds((current) => current.filter((id) => id !== productId));
  };

  // Memeriksa apakah produk sudah disimpan
  const isWishlisted = (productId: number) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        removeWishlist,
        isWishlisted,
        isHydrated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook untuk mengakses wishlist
export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}

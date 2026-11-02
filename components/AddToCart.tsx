"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type AddToCartProps = {
  productId: number;
};

export default function AddToCart({ productId }: AddToCartProps) {
  const { addToCart, isHydrated } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(productId);
    setAdded(true);
  };

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!isHydrated}
        className="w-full rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isHydrated
          ? "Loading Cart..."
          : added
            ? "Added to Cart ✓"
            : "Add to Cart 🛒"}
      </button>

      {added && (
        <p
          role="status"
          className="mt-3 text-center text-sm font-medium text-[#527C3E]"
        >
          Product successfully added to your cart!
        </p>
      )}
    </div>
  );
}

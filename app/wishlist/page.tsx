"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useWishlist } from "@/components/WishlistToggle";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  icon: string | null;
}

export default function WishlistPage() {
  const { wishlistIds, removeWishlist, isHydrated } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch products.");
        }

        if (isActive) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to load wishlist products:", error);

        if (isActive) {
          setProductsError("Unable to load wishlist products.");
        }
      } finally {
        if (isActive) {
          setIsProductsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, []);

  // Mengambil produk yang tersimpan di Wishlist
  const wishlistProducts = products.filter((product) =>
    wishlistIds.includes(product.id),
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="min-h-screen bg-[#F7F8F2] text-[#183B2B]">
      <Navbar />

      {/* Page Heading */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">
        <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
          YOUR FAVORITES
        </p>

        <h1 className="mt-4 text-4xl font-bold md:text-6xl">
          My Wishlist <span className="text-red-400">♥</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-gray-500">
          Keep your favorite products in one place and discover the essentials
          for a safer, greener future.
        </p>

        {isHydrated && (
          <p className="mt-5 text-sm font-medium text-[#527C3E]">
            {wishlistProducts.length} Saved Products
          </p>
        )}
      </section>

      {/* Wishlist Content */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {!isHydrated || (wishlistIds.length > 0 && isProductsLoading) ? (
          <div className="rounded-3xl bg-white py-24 text-center">
            <p className="text-gray-500">Loading your wishlist...</p>
          </div>
        ) : productsError && wishlistIds.length > 0 ? (
          <div className="rounded-3xl bg-white py-24 text-center">
            <p className="text-red-500">{productsError}</p>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {wishlistProducts.map((product) => (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-3xl border border-[#183B2B]/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Remove Wishlist Button */}
                <button
                  type="button"
                  onClick={() => removeWishlist(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-red-500 shadow transition hover:scale-110"
                >
                  ♥
                </button>

                {/* Product Link */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="flex h-52 items-center justify-center bg-[#E5EEDB] transition group-hover:bg-[#DCE9D1]">
                    <span className="text-7xl transition group-hover:scale-110">
                      {product.icon}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold text-[#76A65B]">
                      {product.category.toUpperCase()}
                    </p>

                    <h2 className="mt-2 text-lg font-bold">{product.name}</h2>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                      {product.description}
                    </p>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          /* Empty Wishlist */
          <div className="rounded-3xl bg-white px-6 py-24 text-center">
            <span className="text-6xl text-red-300">♡</span>

            <h2 className="mt-6 text-2xl font-bold">Your Wishlist is Empty</h2>

            <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
              You haven't saved any products yet. Explore our collection and add
              your favorite products to your Wishlist.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
            >
              Explore Products ↗
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

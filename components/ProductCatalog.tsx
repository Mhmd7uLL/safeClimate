"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "./WishlistToggle";

const categories = [
  "All Products",
  "Emergency",
  "Flood Protection",
  "Heat Protection",
  "Water Sustainability",
];

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  icon: string | null;
}

export default function ProductCatalog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data produk dari API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch products");
        }

        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter produk berdasarkan pencarian dan kategori
  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "All Products" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      {/* Search Bar */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="relative max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-[#183B2B]/15 bg-white px-6 py-4 pl-12 text-sm outline-none transition focus:border-[#76A65B] focus:ring-2 focus:ring-[#76A65B]/20"
          />

          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </section>

      {/* Category Filter */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);

                if (category === "All Products") {
                  setSearch("");
                }
              }}
              className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                selectedCategory === category
                  ? "border-[#183B2B] bg-[#183B2B] text-white"
                  : "border-[#183B2B]/15 text-gray-600 hover:bg-[#E5EEDB]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Product Information */}
      <section className="mx-auto max-w-7xl px-6 pb-5">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-[#183B2B]">
            {filteredProducts.length}
          </span>{" "}
          of {products.length} products
        </p>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {isLoading ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 animate-pulse">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isFavorite = isWishlisted(product.id);

              return (
                <article
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl border border-[#183B2B]/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={
                      isFavorite ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={isFavorite}
                    className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl shadow transition hover:scale-110 ${
                      isFavorite ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>

                  {/* Product Detail Link */}
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
                        <p className="text-lg font-bold text-[#183B2B]">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-white px-6 py-20 text-center">
            <span className="text-5xl">🔎</span>
            <h2 className="mt-5 text-xl font-bold">No Products Found</h2>
            <p className="mt-3 text-sm text-gray-500">
              Try another keyword or select a different category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All Products");
              }}
              className="mt-6 rounded-full bg-[#183B2B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#28583E]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  icon: string | null;
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, isHydrated } =
    useCart();

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
        console.error("Failed to load cart products:", error);

        if (isActive) {
          setProductsError("Unable to load product information.");
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

  // Mengambil informasi produk dari data pusat
  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((product) => product.id === item.productId);

      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter((item) => item !== null);

  // Menghitung subtotal seluruh produk
  const subtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  );

  // Format harga Rupiah
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
          YOUR SHOPPING BAG
        </p>

        <h1 className="mt-4 text-4xl font-bold md:text-6xl">
          Shopping Cart <span>🛒</span>
        </h1>

        <p className="mt-5 max-w-xl leading-7 text-gray-500">
          Review your selected products and prepare your order for a more
          sustainable future.
        </p>
      </section>

      {/* Cart Content */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {!isHydrated || (cartItems.length > 0 && isProductsLoading) ? (
          <div className="rounded-3xl bg-white py-24 text-center">
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : productsError && cartItems.length > 0 ? (
          <div className="rounded-3xl bg-white py-24 text-center">
            <p className="text-red-500">{productsError}</p>
          </div>
        ) : cartProducts.length === 0 ? (
          /* Empty Cart */
          <div className="rounded-3xl bg-white px-6 py-24 text-center">
            <span className="text-7xl">🛒</span>

            <h2 className="mt-6 text-2xl font-bold">Your Cart is Empty</h2>

            <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
              You haven't added any products to your cart yet. Explore our
              collection and discover products for a safer, greener future.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
            >
              Explore Products ↗
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  Your Items ({cartProducts.length})
                </p>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm font-medium text-red-500 transition hover:text-red-700"
                >
                  Clear Cart
                </button>
              </div>

              {cartProducts.map((product) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-5 rounded-3xl border border-[#183B2B]/10 bg-white p-5 sm:flex-row"
                >
                  {/* Product Image */}
                  <Link
                    href={`/products/${product.id}`}
                    className="flex h-36 shrink-0 items-center justify-center rounded-2xl bg-[#E5EEDB] sm:w-36"
                  >
                    <span className="text-6xl">{product.icon}</span>
                  </Link>

                  {/* Product Information */}
                  <div className="flex flex-1 flex-col justify-between gap-5">
                    <div>
                      <p className="text-xs font-semibold text-[#76A65B]">
                        {product.category.toUpperCase()}
                      </p>

                      <Link href={`/products/${product.id}`}>
                        <h2 className="mt-2 text-lg font-bold hover:text-[#527C3E]">
                          {product.name}
                        </h2>
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-4 rounded-full border border-[#183B2B]/15 px-4 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, product.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="text-lg font-bold hover:text-[#76A65B]"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center text-sm font-semibold">
                          {product.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(product.id, product.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="text-lg font-bold hover:text-[#76A65B]"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Product Subtotal */}
                  <div className="flex items-end justify-end sm:min-w-32">
                    <p className="font-bold">
                      {formatPrice(product.price * product.quantity)}
                    </p>
                  </div>
                </article>
              ))}

              <Link
                href="/products"
                className="inline-block pt-3 text-sm font-semibold text-[#527C3E] hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <aside className="rounded-3xl border border-[#183B2B]/10 bg-white p-7">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-7 space-y-5">
                <div className="flex justify-between gap-4 text-sm text-gray-500">
                  <span>Total Items</span>
                  <span className="font-semibold text-[#183B2B]">
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#183B2B]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="my-7 border-t border-gray-200" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-4 text-xs leading-6 text-gray-400">
                Shipping costs are not included and will be calculated during
                checkout.
              </p>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-full bg-[#183B2B] px-6 py-4 text-center font-semibold text-white transition hover:bg-[#28583E]"
              >
                Proceed to Checkout →
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

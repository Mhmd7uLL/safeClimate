"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";

interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const shippingOptions = [
  {
    id: "eco",
    name: "Eco Delivery",
    description: "Pengiriman lebih ramah lingkungan",
    price: 5000,
  },
  {
    id: "regular",
    name: "Regular Delivery",
    description: "Pengiriman standar",
    price: 10000,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Pengiriman lebih cepat",
    price: 20000,
  },
] as const;

type ShippingMethod = (typeof shippingOptions)[number]["id"];

interface CompletedOrder {
  id: string;
  customerName: string;
  total: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  icon: string | null;
}

export default function CheckoutPage() {
  const { cartItems, totalItems, clearCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

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
        console.error("Failed to load checkout products:", error);

        if (isActive) {
          setProductsError(true);
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

  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("eco");

  const selectedShipping = shippingOptions.find(
    (option) => option.id === shippingMethod,
  )!;

  const subtotal = cartItems.reduce((total, item) => {
    const product = products.find((product) => product.id === item.productId);

    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const totalPayment = subtotal + selectedShipping.price;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: customerData,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.order) {
        throw new Error(data.message || "Failed to place your order.");
      }

      // Menyimpan nomor pesanan untuk akses Order History
      let historySaved = true;

      try {
        const savedNumbers = JSON.parse(
          localStorage.getItem("safeclimate-order-numbers") || "[]",
        );

        const orderNumbers: string[] = Array.isArray(savedNumbers)
          ? savedNumbers.filter(
              (number): number is string => typeof number === "string",
            )
          : [];

        const updatedNumbers = [
          ...new Set([...orderNumbers, data.order.orderNumber]),
        ];

        localStorage.setItem(
          "safeclimate-order-numbers",
          JSON.stringify(updatedNumbers),
        );

        // Menyimpan token akses setiap pesanan
        const savedTokens: unknown = JSON.parse(
          localStorage.getItem("safeclimate-order-tokens") || "{}",
        );

        const currentTokens =
          savedTokens &&
          typeof savedTokens === "object" &&
          !Array.isArray(savedTokens)
            ? (savedTokens as Record<string, string>)
            : {};

        const updatedTokens = {
          ...currentTokens,
          [data.order.orderNumber]: data.order.accessToken,
        };

        localStorage.setItem(
          "safeclimate-order-tokens",
          JSON.stringify(updatedTokens),
        );
      } catch (storageError) {
        historySaved = false;
        console.error("Failed to save order history reference:", storageError);
      }

      // Menampilkan konfirmasi pesanan
      setCompletedOrder({
        id: data.order.orderNumber,
        customerName: data.order.customerName,
        total: Number(data.order.total),
      });

      // Mengosongkan keranjang setelah transaksi berhasil
      clearCart();

      if (!historySaved) {
        alert(
          "Your order was saved, but its history reference could not be stored. Please keep your Order ID: " +
            data.order.orderNumber,
        );
      }
    } catch (error) {
      console.error("Checkout failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to place your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(
    null,
  );

  if (completedOrder) {
    return (
      <main className="flex-1 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you, {completedOrder.customerName}! Your order has been
            successfully placed.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-5 text-left">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="mt-1 font-semibold text-gray-900">
              {completedOrder.id}
            </p>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">Total Payment</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {formatPrice(completedOrder.total)}
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="mt-8 inline-block w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/cart" className="text-sm text-green-700 hover:underline">
          ← Back to Cart
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Checkout</h1>

        <p className="mt-2 text-gray-600">
          Complete your information to place your order.
        </p>

        {cartItems.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Your cart is empty.</p>

            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-green-700 px-6 py-3 text-white hover:bg-green-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {/* Customer Information */}
            <section className="rounded-xl bg-white p-6 shadow-sm md:col-span-2">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Shipping Information
              </h2>

              <form
                id="shipping-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={customerData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Street Address
                  </label>
                  <textarea
                    name="address"
                    value={customerData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Enter your full address"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter your city"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-black">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerData.postalCode}
                      onChange={handleChange}
                      required
                      placeholder="Enter postal code"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 text-black"
                    />
                  </div>
                </div>
              </form>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm md:col-span-2">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Shipping Method
              </h2>

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                      shippingMethod === option.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={shippingMethod === option.id}
                        onChange={() => setShippingMethod(option.id)}
                        className="accent-green-700"
                      />

                      <div>
                        <p className="font-medium text-gray-900">
                          {option.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <span className="font-semibold text-gray-900">
                      Rp{option.price.toLocaleString("id-ID")}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Order Summary */}

            <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Order Summary
              </h2>

              <p className="mt-4 text-sm text-gray-600">
                Total items: {totalItems}
              </p>

              <div className="mt-5 space-y-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(selectedShipping.price)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold text-gray-900">
                    Total Payment
                  </span>

                  <span className="text-lg font-bold text-green-700">
                    {formatPrice(totalPayment)}
                  </span>
                </div>

                <button
                  type="submit"
                  form="shipping-form"
                  disabled={isSubmitting || isProductsLoading || productsError}
                  className="mt-6 w-full rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing Order..."
                    : isProductsLoading
                      ? "Loading Products..."
                      : productsError
                        ? "Products Unavailable"
                        : "Place Order"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

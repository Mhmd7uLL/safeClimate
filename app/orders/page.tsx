"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  shipping: {
    method: string;
    name: string;
    price: number;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "placed" | "cancelled"
  >("all");

  const filteredOrders = orders.filter((order) => {
    const status = order.status.toLowerCase();

    if (activeFilter === "placed") {
      return status === "placed" || status === "order placed";
    }

    if (activeFilter === "cancelled") {
      return status === "cancelled" || status === "order cancelled";
    }

    return true;
  });

  useEffect(() => {
    let isActive = true;

    async function fetchOrders() {
      try {
        // Mengambil daftar nomor pesanan dari Local Storage
        const savedNumbers = localStorage.getItem("safeclimate-order-numbers");

        const parsed: unknown = savedNumbers ? JSON.parse(savedNumbers) : [];

        const orderNumbers: string[] = Array.isArray(parsed)
          ? parsed.filter(
              (number): number is string => typeof number === "string",
            )
          : [];

        // Jika belum ada pesanan
        if (orderNumbers.length === 0) {
          if (isActive) setOrders([]);
          return;
        }

        // Membuat query parameter untuk API
        const params = new URLSearchParams();

        orderNumbers.forEach((number) => {
          params.append("number", number);
        });

        // Mengambil token akses dari Local Storage
        const savedTokens: unknown = JSON.parse(
          localStorage.getItem("safeclimate-order-tokens") || "{}",
        );

        const accessTokens =
          savedTokens &&
          typeof savedTokens === "object" &&
          !Array.isArray(savedTokens)
            ? (savedTokens as Record<string, string>)
            : {};

        // Menyiapkan token untuk setiap nomor pesanan
        const requestedTokens: Record<string, string> = {};

        for (const number of orderNumbers) {
          const token = accessTokens[number];

          if (typeof token === "string") {
            requestedTokens[number] = token;
          }
        }

        // Mengambil detail pesanan dari PostgreSQL
        const response = await fetch(`/api/orders?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "x-order-access-tokens": JSON.stringify(requestedTokens),
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch order history.");
        }

        if (isActive) {
          // Mengubah nilai BIGINT menjadi number
          const formattedOrders: Order[] = data.orders.map((order: Order) => ({
            ...order,
            subtotal: Number(order.subtotal),
            shippingFee: Number(order.shippingFee),
            total: Number(order.total),

            shipping: {
              ...order.shipping,
              price: Number(order.shipping.price),
            },

            items: order.items.map((item) => ({
              ...item,
              price: Number(item.price),
            })),
          }));

          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);

        if (isActive) {
          setLoadError("Failed to load order history. Please try again.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  async function handleCancelOrder(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
    );

    if (!confirmed || cancellingOrderId) return;

    setCancellingOrderId(orderId);

    try {
      // Mengambil token akses pesanan dari Local Storage
      const savedTokens: unknown = JSON.parse(
        localStorage.getItem("safeclimate-order-tokens") || "{}",
      );

      const accessTokens =
        savedTokens &&
        typeof savedTokens === "object" &&
        !Array.isArray(savedTokens)
          ? (savedTokens as Record<string, unknown>)
          : {};

      const accessToken = accessTokens[orderId];

      if (
        typeof accessToken !== "string" ||
        !/^[0-9a-f]{64}$/.test(accessToken)
      ) {
        throw new Error(
          "Order access token not found. Please check your order.",
        );
      }

      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-order-access-token": accessToken,
        },
        body: JSON.stringify({
          orderNumber: orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel order.");
      }

      // Memperbarui status pesanan di tampilan
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order,
        ),
      );

      // Menutup detail pesanan jika sedang dibuka
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to cancel your order. Please try again.",
      );
    } finally {
      setCancellingOrderId(null);
    }
  }

  return (
    <main className="flex-1 bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-green-700 hover:underline">
          ← Back to Home
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Order History</h1>

        <p className="mt-2 text-gray-600">
          Keep track of your previous purchases.
        </p>

        {isLoading ? (
          <p className="mt-8 text-gray-500">Loading orders...</p>
        ) : loadError ? (
          <div className="mt-8 rounded-xl bg-white p-8 text-center">
            <p className="text-red-600">{loadError}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-green-700 px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mt-2 text-gray-500">
              You have not placed any orders yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Order Filters */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: "All Orders", value: "all" },
                { label: "Order Placed", value: "placed" },
                { label: "Order Cancelled", value: "cancelled" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.value as "all" | "placed" | "cancelled",
                    )
                  }
                  className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    activeFilter === filter.value
                      ? "border-[#183B2B] bg-[#183B2B] text-white"
                      : "border-[#183B2B]/15 bg-white text-gray-600 hover:bg-[#E5EEDB]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  No Orders Found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  There are no orders in this category yet.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>

                      <h2 className="font-semibold text-gray-900">
                        {order.id}
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId((current) =>
                            current === order.id ? null : order.id,
                          )
                        }
                        className="mt-4 text-sm font-semibold text-green-700 hover:text-green-900"
                      >
                        {expandedOrderId === order.id
                          ? "Hide Details ↑"
                          : "View Details ↓"}
                      </button>

                      {expandedOrderId === order.id && (
                        <section className="mt-4 rounded-lg bg-gray-50 p-5">
                          <h3 className="font-semibold text-gray-900">
                            Customer Information
                          </h3>

                          <div className="mt-3 space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium text-gray-800">
                                Name:
                              </span>{" "}
                              {order.customer.fullName}
                            </p>

                            <p>
                              <span className="font-medium text-gray-800">
                                Email:
                              </span>{" "}
                              {order.customer.email}
                            </p>

                            <p>
                              <span className="font-medium text-gray-800">
                                Phone:
                              </span>{" "}
                              {order.customer.phone}
                            </p>

                            <p>
                              <span className="font-medium text-gray-800">
                                Address:
                              </span>{" "}
                              {order.customer.address}, {order.customer.city},{" "}
                              {order.customer.postalCode}
                            </p>
                          </div>

                          <div className="mt-5 border-t border-gray-200 pt-4">
                            <h3 className="font-semibold text-gray-900">
                              Shipping Information
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                              Method: {order.shipping.name}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              Shipping Fee: {formatPrice(order.shipping.price)}
                            </p>
                          </div>
                        </section>
                      )}

                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {order.status}
                    </span>
                  </div>

                  <div className="py-5">
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Products
                    </h3>

                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.productId}-${index}`}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>

                            <p className="text-gray-500">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>

                          <p className="font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        Shipping ({order.shipping.name})
                      </span>
                      <span className="text-gray-900">
                        {formatPrice(order.shippingFee)}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                      <span className="font-semibold text-gray-900">
                        Total Payment
                      </span>

                      <span className="text-lg font-bold text-green-700">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {order.status === "Order Placed" ? (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId !== null}
                      className="mt-6 w-full rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingOrderId === order.id
                        ? "Cancelling Order..."
                        : "Cancel Order"}
                    </button>
                  ) : (
                    <p className="mt-6 rounded-lg bg-red-50 px-5 py-3 text-center text-sm font-medium text-red-600">
                      This order has been cancelled.
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

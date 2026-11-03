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

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("safeclimate-orders");

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  function handleCancelOrder(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const updatedOrders = orders.filter((order) => order.id !== orderId);

      localStorage.setItem("safeclimate-orders", JSON.stringify(updatedOrders));

      setOrders(updatedOrders);

      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel your order. Please try again.");
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
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>

                    <h2 className="font-semibold text-gray-900">{order.id}</h2>

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
                  <h3 className="mb-3 font-semibold text-gray-900">Products</h3>

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

                <button
                  type="button"
                  onClick={() => handleCancelOrder(order.id)}
                  className="mt-6 w-full rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Cancel Order
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

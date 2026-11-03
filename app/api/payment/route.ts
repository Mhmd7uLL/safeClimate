import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getMidtransSnap } from "@/lib/midtrans";

function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const { orderNumber, accessToken } = data;

    if (
      typeof orderNumber !== "string" ||
      !/^SC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        orderNumber,
      ) ||
      typeof accessToken !== "string" ||
      !/^[0-9a-f]{64}$/.test(accessToken)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order credentials." },
        { status: 400 },
      );
    }

    // Memvalidasi pesanan berdasarkan access token
    const orderResult = await db.query(
      `
        SELECT
          id,
          order_number,
          customer_name,
          email,
          phone,
          address,
          city,
          postal_code,
          shipping_fee,
          subtotal,
          total,
          status,
          payment_status
        FROM orders
        WHERE
          order_number = $1
          AND access_token_hash = $2
        LIMIT 1
      `,
      [orderNumber, hashAccessToken(accessToken)],
    );

    if (orderResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found or access denied." },
        { status: 404 },
      );
    }

    const order = orderResult.rows[0];

    if (order.status !== "placed") {
      return NextResponse.json(
        { success: false, message: "This order cannot be paid." },
        { status: 409 },
      );
    }

    if (order.payment_status !== "unpaid") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment has already been initiated or completed.",
        },
        { status: 409 },
      );
    }

    // Mengambil detail produk dari database
    const itemsResult = await db.query(
      `
        SELECT
          product_id,
          product_name,
          unit_price,
          quantity
        FROM order_items
        WHERE order_id = $1
      `,
      [order.id],
    );

    if (itemsResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order has no items." },
        { status: 400 },
      );
    }

    const subtotal = Number(order.subtotal);
    const shippingFee = Number(order.shipping_fee);
    const total = Number(order.total);

    if (
      !Number.isSafeInteger(subtotal) ||
      !Number.isSafeInteger(shippingFee) ||
      !Number.isSafeInteger(total) ||
      total !== subtotal + shippingFee ||
      total <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount." },
        { status: 400 },
      );
    }

    const itemDetails = itemsResult.rows.map((item) => {
      const price = Number(item.unit_price);
      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(price) ||
        price <= 0 ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("Invalid order item data.");
      }

      return {
        id: String(item.product_id),
        price,
        quantity,
        name: String(item.product_name).slice(0, 50),
      };
    });

    // Memasukkan biaya pengiriman ke detail transaksi
    if (shippingFee > 0) {
      itemDetails.push({
        id: "shipping",
        price: shippingFee,
        quantity: 1,
        name: "Shipping Fee",
      });
    }

    const itemTotal = itemDetails.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (itemTotal !== total) {
      return NextResponse.json(
        { success: false, message: "Order amount does not match." },
        { status: 400 },
      );
    }

    // Membuat transaksi Snap di Midtrans
    const snap = getMidtransSnap();

    const transactionParameters = {
      transaction_details: {
        order_id: order.order_number,
        gross_amount: total,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: String(order.customer_name).slice(0, 255),
        email: order.email,
        phone: order.phone,
      },
    };

    const transaction = await snap.createTransaction(transactionParameters);

    if (!transaction.token) {
      throw new Error("Midtrans did not return a Snap Token.");
    }

    // Memperbarui status pembayaran
    const updateResult = await db.query(
      `
        UPDATE orders
        SET payment_status = 'pending'
        WHERE
          id = $1
          AND payment_status = 'unpaid'
          AND status = 'placed'
        RETURNING order_number
      `,
      [order.id],
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order payment state has changed." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment transaction created.",
        payment: {
          orderNumber: order.order_number,
          token: transaction.token,
          redirectUrl: transaction.redirect_url,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to create payment:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create payment transaction." },
      { status: 500 },
    );
  }
}

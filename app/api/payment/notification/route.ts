import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid notification." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const { order_id, status_code, gross_amount, signature_key } = data;

    if (
      typeof order_id !== "string" ||
      typeof status_code !== "string" ||
      typeof gross_amount !== "string" ||
      typeof signature_key !== "string" ||
      !/^[a-f0-9]{128}$/i.test(signature_key)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid notification data." },
        { status: 400 },
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
    }

    const expectedSignature = createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest();

    const receivedSignature = Buffer.from(signature_key, "hex");

    if (!timingSafeEqual(expectedSignature, receivedSignature)) {
      return NextResponse.json(
        { success: false, message: "Invalid signature." },
        { status: 403 },
      );
    }

    const orderResult = await db.query(
      `
    SELECT
      id,
      total,
      payment_status
    FROM orders
    WHERE order_number = $1
    LIMIT 1
  `,
      [order_id],
    );

    if (orderResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 },
      );
    }

    const order = orderResult.rows[0];
    const notificationAmount = Number(gross_amount);

    if (
      !Number.isSafeInteger(notificationAmount) ||
      notificationAmount !== Number(order.total)
    ) {
      return NextResponse.json(
        { success: false, message: "Payment amount mismatch." },
        { status: 400 },
      );
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    if (typeof transactionStatus !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid transaction status." },
        { status: 400 },
      );
    }

    let paymentStatus: string;

    switch (transactionStatus) {
      case "capture":
        paymentStatus = fraudStatus === "accept" ? "paid" : "pending";
        break;

      case "settlement":
        paymentStatus = "paid";
        break;

      case "pending":
        paymentStatus = "pending";
        break;

      case "deny":
        paymentStatus = "failed";
        break;

      case "cancel":
        paymentStatus = "cancelled";
        break;

      case "expire":
        paymentStatus = "expired";
        break;

      case "refund":
        paymentStatus = "refunded";
        break;

      case "partial_refund":
        paymentStatus = "partially_refunded";
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Unsupported transaction status." },
          { status: 400 },
        );
    }

    const transactionId =
      typeof data.transaction_id === "string" ? data.transaction_id : null;

    const paymentType =
      typeof data.payment_type === "string" ? data.payment_type : null;

    const updateResult = await db.query(
      `
    UPDATE orders
    SET
      payment_status = $1,
      midtrans_transaction_id = COALESCE($2, midtrans_transaction_id),
      payment_type = COALESCE($3, payment_type),
      paid_at = CASE
        WHEN $1 = 'paid' THEN COALESCE(paid_at, CURRENT_TIMESTAMP)
        ELSE paid_at
      END
    WHERE
      id = $4
      AND (
        payment_status <> 'paid'
        OR $1 IN ('refunded', 'partially_refunded')
      )
    RETURNING order_number
  `,
      [paymentStatus, transactionId, paymentType, order.id],
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json({
        success: true,
        message: "Notification already processed or payment state unchanged.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Notification signature verified.",
    });
  } catch (error) {
    console.error("Midtrans notification error:", error);

    return NextResponse.json(
      { success: false, message: "Notification processing failed." },
      { status: 500 },
    );
  }
}

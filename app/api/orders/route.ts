import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PoolClient } from "pg";

// Membuat token akses acak
function generateAccessToken() {
  return randomBytes(32).toString("hex");
}

// Mengubah token menjadi hash SHA-256
function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const shippingOptions = {
  eco: 5000,
  regular: 10000,
  express: 20000,
};

interface CartRequestItem {
  productId: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: string | number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;

  // Membaca request
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON request." },
      { status: 400 },
    );
  }

  if (!isObject(body) || !isObject(body.customer)) {
    return NextResponse.json(
      { success: false, message: "Invalid order data." },
      { status: 400 },
    );
  }

  // Validasi data penerima
  const rawCustomer = body.customer;

  const customer = {
    fullName: rawCustomer.fullName,
    email: rawCustomer.email,
    phone: rawCustomer.phone,
    address: rawCustomer.address,
    city: rawCustomer.city,
    postalCode: rawCustomer.postalCode,
  };

  if (
    Object.values(customer).some(
      (value) => typeof value !== "string" || value.trim().length === 0,
    )
  ) {
    return NextResponse.json(
      { success: false, message: "All customer fields are required." },
      { status: 400 },
    );
  }

  const cleanCustomer = {
    fullName: (customer.fullName as string).trim(),
    email: (customer.email as string).trim(),
    phone: (customer.phone as string).trim(),
    address: (customer.address as string).trim(),
    city: (customer.city as string).trim(),
    postalCode: (customer.postalCode as string).trim(),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCustomer.email)) {
    return NextResponse.json(
      { success: false, message: "Invalid email address." },
      { status: 400 },
    );
  }

  if (
    cleanCustomer.fullName.length > 150 ||
    cleanCustomer.email.length > 255 ||
    cleanCustomer.phone.length > 30 ||
    cleanCustomer.address.length > 2000 ||
    cleanCustomer.city.length > 100 ||
    cleanCustomer.postalCode.length > 20
  ) {
    return NextResponse.json(
      { success: false, message: "Customer information is too long." },
      { status: 400 },
    );
  }

  // Validasi produk dari keranjang
  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 50
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid cart items." },
      { status: 400 },
    );
  }

  const items: CartRequestItem[] = [];
  const usedProductIds = new Set<number>();

  for (const item of body.items) {
    if (
      !isObject(item) ||
      !Number.isSafeInteger(item.productId) ||
      (item.productId as number) <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      (item.quantity as number) <= 0 ||
      (item.quantity as number) > 99
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid product or quantity." },
        { status: 400 },
      );
    }

    const productId = item.productId as number;

    if (usedProductIds.has(productId)) {
      return NextResponse.json(
        { success: false, message: "Duplicate product detected." },
        { status: 400 },
      );
    }

    usedProductIds.add(productId);

    items.push({
      productId,
      quantity: item.quantity as number,
    });
  }

  // Validasi metode pengiriman
  const shippingMethod = body.shippingMethod;

  if (
    typeof shippingMethod !== "string" ||
    !Object.prototype.hasOwnProperty.call(shippingOptions, shippingMethod)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid shipping method." },
      { status: 400 },
    );
  }

  const shippingFee =
    shippingOptions[shippingMethod as keyof typeof shippingOptions];

  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    // Mengambil harga produk langsung dari database
    const productResult = await client.query<Product>(
      `
        SELECT id, name, price
        FROM products
        WHERE id = ANY($1::int[])
      `,
      [items.map((item) => item.productId)],
    );

    if (productResult.rows.length !== items.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "One or more products were not found." },
        { status: 404 },
      );
    }

    const productMap = new Map(
      productResult.rows.map((product) => [product.id, product]),
    );

    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product data is missing.");
      }

      const price = Number(product.price);

      if (!Number.isSafeInteger(price) || price < 0) {
        throw new Error("Invalid product price in database.");
      }

      subtotal += price * item.quantity;

      return {
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
      };
    });

    const total = subtotal + shippingFee;

    if (!Number.isSafeInteger(total)) {
      throw new Error("Order total exceeds the supported limit.");
    }

    // Membuat nomor pesanan unik
    const orderNumber = `SC-${randomUUID()}`;
    // Membuat token akses pesanan
    const accessToken = generateAccessToken();
    const accessTokenHash = hashAccessToken(accessToken);

    // Menyimpan informasi utama pesanan
    const orderResult = await client.query(
      `
        INSERT INTO orders (
          order_number,
          customer_name,
          email,
          phone,
          address,
          city,
          postal_code,
          shipping_method,
          shipping_fee,
          subtotal,
          total,
          status,
          access_token_hash
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'placed', $12)
        RETURNING id
      `,
      [
        orderNumber,
        cleanCustomer.fullName,
        cleanCustomer.email,
        cleanCustomer.phone,
        cleanCustomer.address,
        cleanCustomer.city,
        cleanCustomer.postalCode,
        shippingMethod,
        shippingFee,
        subtotal,
        total,
        accessTokenHash,
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Menyimpan setiap produk dalam pesanan
    for (const item of orderItems) {
      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            unit_price,
            quantity
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [orderId, item.productId, item.name, item.price, item.quantity],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Order successfully created.",
        order: {
          orderNumber,
          accessToken,
          customerName: cleanCustomer.fullName,
          subtotal,
          shippingFee,
          total,
          status: "placed",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Order creation failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create order." },
      { status: 500 },
    );
  } finally {
    client?.release();
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Mengambil nomor pesanan dari query parameter
  const orderNumbers = url.searchParams.getAll("number");

  if (orderNumbers.length === 0) {
    return NextResponse.json({
      success: true,
      orders: [],
    });
  }

  // Membatasi jumlah pesanan yang dapat diminta
  if (
    orderNumbers.length > 50 ||
    orderNumbers.some(
      (number) =>
        !/^SC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          number,
        ),
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid order numbers.",
      },
      { status: 400 },
    );
  }

  // Mengambil token akses dari request header
  const rawAccessTokens = request.headers.get("x-order-access-tokens");

  let parsedAccessTokens: unknown = {};

  if (rawAccessTokens) {
    try {
      parsedAccessTokens = JSON.parse(rawAccessTokens);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid access tokens.",
        },
        { status: 400 },
      );
    }
  }

  // Memastikan data token berbentuk object
  if (
    typeof parsedAccessTokens !== "object" ||
    parsedAccessTokens === null ||
    Array.isArray(parsedAccessTokens)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid access tokens.",
      },
      { status: 400 },
    );
  }

  const accessTokens = parsedAccessTokens as Record<string, unknown>;

  // Memasangkan nomor pesanan dengan hash token
  const authorizedRequests: {
    order_number: string;
    token_hash: string;
  }[] = [];

  for (const number of new Set(orderNumbers)) {
    const token = accessTokens[number];

    if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) {
      continue;
    }

    authorizedRequests.push({
      order_number: number,
      token_hash: hashAccessToken(token),
    });
  }

  try {
    const result = await db.query(
      `
        SELECT
          o.order_number AS id,
          o.created_at AS "createdAt",

          json_build_object(
            'fullName', o.customer_name,
            'email', o.email,
            'phone', o.phone,
            'address', o.address,
            'city', o.city,
            'postalCode', o.postal_code
          ) AS customer,

          COALESCE(
            json_agg(
              json_build_object(
                'productId', oi.product_id,
                'name', oi.product_name,
                'price', oi.unit_price,
                'quantity', oi.quantity
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) AS items,

          json_build_object(
            'method', o.shipping_method,
            'name',
              CASE o.shipping_method
                WHEN 'eco' THEN 'Eco Delivery'
                WHEN 'regular' THEN 'Regular Delivery'
                WHEN 'express' THEN 'Express Delivery'
              END,
            'price', o.shipping_fee
          ) AS shipping,

          o.subtotal,
          o.shipping_fee AS "shippingFee",
          o.total,

          CASE o.status
            WHEN 'placed' THEN 'Order Placed'
            WHEN 'cancelled' THEN 'Cancelled'
            ELSE o.status
          END AS status

        FROM orders o

        LEFT JOIN order_items oi
          ON oi.order_id = o.id

        WHERE EXISTS (
            SELECT 1
            FROM unnest($1::varchar[], $2::varchar[])
            AS requested(order_number, token_hash)
            WHERE requested.order_number = o.order_number
            AND requested.token_hash = o.access_token_hash
        )

        GROUP BY o.id

        ORDER BY o.created_at DESC
      `,
      [
        authorizedRequests.map((item) => item.order_number),
        authorizedRequests.map((item) => item.token_hash),
      ],
    );

    return NextResponse.json(
      {
        success: true,
        orders: result.rows,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order history.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      !isObject(body) ||
      typeof body.orderNumber !== "string" ||
      !/^SC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.orderNumber,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order number.",
        },
        { status: 400 },
      );
    }

    // Mengambil token akses dari request header
    const accessToken = request.headers.get("x-order-access-token");

    if (!accessToken || !/^[0-9a-f]{64}$/.test(accessToken)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing access token.",
        },
        { status: 401 },
      );
    }

    // Mengubah token menjadi hash
    const accessTokenHash = hashAccessToken(accessToken);

    // Membatalkan pesanan jika token cocok
    const result = await db.query(
      `
        UPDATE orders
        SET
          status = 'cancelled',
          cancelled_at = CURRENT_TIMESTAMP
        WHERE
          order_number = $1
          AND access_token_hash = $2
          AND status = 'placed'
        RETURNING
          order_number AS "orderNumber",
          status,
          cancelled_at AS "cancelledAt"
      `,
      [body.orderNumber, accessTokenHash],
    );

    if (result.rowCount === 0) {
      // Memeriksa pesanan menggunakan nomor dan hash token
      const existingOrder = await db.query(
        `
          SELECT status
          FROM orders
          WHERE
            order_number = $1
            AND access_token_hash = $2
        `,
        [body.orderNumber, accessTokenHash],
      );

      // Tidak mengungkapkan apakah nomor pesanan benar-benar ada
      if (existingOrder.rowCount === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Order not found or access denied.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "This order has already been cancelled.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully cancelled.",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to cancel order:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel order.",
      },
      { status: 500 },
    );
  }
}

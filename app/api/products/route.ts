import { connection } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  await connection();

  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        category,
        price,
        description,
        icon
      FROM products
      ORDER BY id ASC
    `);

    const products = result.rows.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    return Response.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      { status: 500 },
    );
  }
}

import { loadEnvConfig } from "@next/env";

// Memuat environment variables dari .env.local
loadEnvConfig(process.cwd());

async function seedProducts() {
  // Import setelah environment variables dimuat
  const { db } = await import("../lib/db");
  const { products } = await import("../data/products");

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    for (const product of products) {
      await client.query(
        `
          INSERT INTO products (
            id,
            name,
            category,
            price,
            description,
            icon
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id)
          DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon
        `,
        [
          product.id,
          product.name,
          product.category,
          product.price,
          product.description,
          product.icon ?? null,
        ],
      );
    }

    await client.query("COMMIT");

    console.log(`${products.length} products successfully seeded!`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed products:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seedProducts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

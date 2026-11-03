import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCatalog from "@/components/ProductCatalog";
import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#F7F8F2] text-[#183B2B]">
      {/* Navbar */}
      <Navbar />

      {/* Page Heading */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-12">
        <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
          EXPLORE OUR COLLECTION
        </p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold md:text-6xl">
              Sustainable Products.
            </h1>

            <p className="mt-4 max-w-xl leading-7 text-gray-500">
              Discover essential products designed to help you prepare for
              climate challenges while supporting a more sustainable lifestyle.
            </p>
          </div>

          <p className="text-sm font-semibold text-[#527C3E]">
            <Suspense fallback="Loading product count...">
              <ProductCount />
            </Suspense>
          </p>
        </div>
      </section>

      {/* Interactive Product Catalog */}
      <ProductCatalog />

      {/* Footer */}
      <Footer />
    </main>
  );
}

async function ProductCount() {
  await connection();

  const result = await db.query<{ total: number }>(`
    SELECT COUNT(*)::int AS total
    FROM products
  `);

  return <>{result.rows[0]?.total ?? 0} Products Available</>;
}

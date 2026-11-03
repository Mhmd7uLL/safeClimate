import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8F2] text-[#183B2B]">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-block rounded-full bg-[#E5EEDB] px-4 py-2 text-xs font-semibold text-[#527C3E]">
            🌱 SUSTAINABLE LIVING, SAFER FUTURE
          </span>

          <h1 className="mt-8 text-5xl leading-tight font-bold tracking-tight md:text-7xl">
            Prepare Today,
            <br />
            <span className="text-[#76A65B]">Protect</span>
            <br />
            Tomorrow.
          </h1>

          <p className="mt-6 max-w-lg leading-8 text-gray-600">
            Discover sustainable products and essential equipment to help you
            adapt to climate challenges and build a safer, greener future.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-[#183B2B] px-7 py-4 font-semibold text-white hover:bg-[#28583E]"
            >
              Shop Now ↗
            </Link>

            <Link
              href="/about"
              className="rounded-full border border-[#183B2B]/20 px-7 py-4 font-semibold hover:bg-[#E5EEDB]"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold">20+</p>
              <p className="text-sm text-gray-500">Sustainable Products</p>
            </div>

            <div className="h-10 w-px bg-gray-300" />

            <div>
              <p className="text-2xl font-bold">SDG 13</p>
              <p className="text-sm text-gray-500">Climate Action</p>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#DCE9D1] p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#B6CE9F]" />
          <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-[#A2BF86]" />

          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-[#76A65B]">
              CLIMATE READINESS
            </p>

            <div className="my-8 text-center">
              <span className="text-7xl">🌍</span>
              <h2 className="mt-5 text-2xl font-bold">A Greener Tomorrow</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Small sustainable choices today can make a meaningful difference
                for tomorrow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        {/* Section Heading */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
              OUR FEATURED COLLECTION
            </p>

            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Products for a Better Future.
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-gray-500">
              Explore our selected products designed to support climate
              preparedness and sustainable living.
            </p>
          </div>

          <Link
            href="/products"
            className="font-semibold text-[#527C3E] transition hover:underline"
          >
            View All Products ↗
          </Link>
        </div>

        {/* Product Grid */}
        <Suspense
          fallback={
            <div className="mt-12 py-20 text-center text-gray-500">
              Loading featured products...
            </div>
          }
        >
          <FeaturedProducts />
        </Suspense>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-block rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
          >
            Explore All 20+ Products ↗
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: string | number;
  description: string;
  icon: string | null;
}

async function FeaturedProducts() {
  await connection();

  const result = await db.query<Product>(`
    SELECT
      id,
      name,
      category,
      price,
      description,
      icon
    FROM products
    ORDER BY id ASC
    LIMIT 4
  `);

  const products = result.rows.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          href={`/products/${product.id}`}
          key={product.id}
          className="group block overflow-hidden rounded-3xl border border-[#183B2B]/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Product Illustration */}
          <div className="flex h-52 items-center justify-center bg-[#E5EEDB] transition group-hover:bg-[#DCE9D1]">
            <span className="text-7xl transition group-hover:scale-110">
              {product.icon}
            </span>
          </div>

          {/* Product Information */}
          <div className="p-5">
            <p className="text-xs font-semibold text-[#76A65B]">
              {product.category.toUpperCase()}
            </p>

            <h3 className="mt-2 text-lg font-bold">{product.name}</h3>

            <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
              {product.description}
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

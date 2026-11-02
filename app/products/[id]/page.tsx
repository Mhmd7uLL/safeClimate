import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "../../data/products";
import AddToCart from "@/components/AddToCart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

// Generate halaman untuk seluruh produk
export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

// Halaman utama
export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <main className="min-h-screen bg-[#F7F8F2] text-[#183B2B]">
      <Navbar />

      {/* Product Detail dengan Suspense */}
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-6 py-32 text-center">
            <p className="text-gray-500">Loading product details...</p>
          </section>
        }
      >
        <ProductDetailContent params={params} />
      </Suspense>

      <Footer />
    </main>
  );
}

// Komponen yang membaca params
async function ProductDetailContent({ params }: ProductPageProps) {
  const { id } = await params;

  // Mencari produk berdasarkan ID
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    notFound();
  }

  // Format harga Rupiah
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <>
      {/* Breadcrumb */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#183B2B]">
            Home
          </Link>

          <span>/</span>

          <Link href="/products" className="hover:text-[#183B2B]">
            Products
          </Link>

          <span>/</span>

          <span className="font-medium text-[#183B2B]">{product.name}</span>
        </div>
      </section>

      {/* Product Detail */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        {/* Product Illustration */}
        <div className="flex min-h-[400px] items-center justify-center rounded-[2rem] bg-[#E5EEDB] md:min-h-[550px]">
          <span className="text-9xl">{product.icon}</span>
        </div>

        {/* Product Information */}
        <div>
          <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
            {product.category.toUpperCase()}
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-6 text-2xl font-bold text-[#527C3E]">
            {formatPrice(product.price)}
          </p>

          <div className="my-8 border-t border-[#183B2B]/10" />

          <h2 className="text-lg font-bold">Product Description</h2>

          <p className="mt-4 leading-8 text-gray-500">{product.description}</p>

          <div className="mt-8 rounded-2xl bg-[#E5EEDB] p-5">
            <p className="font-semibold">🌱 Sustainable Living</p>

            <p className="mt-2 text-sm leading-7 text-gray-600">
              Discover practical products that support climate preparedness and
              more responsible everyday choices.
            </p>
          </div>

          <AddToCart productId={product.id} />

          <Link
            href="/products"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
          >
            ← Back to Products
          </Link>
        </div>
      </section>
    </>
  );
}


import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F7F8F2] px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2026 safeClimate. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="transition hover:text-[#183B2B]"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="transition hover:text-[#183B2B]"
          >
            Products
          </Link>

          <Link
            href="/about"
            className="transition hover:text-[#183B2B]"
          >
            About
          </Link>
        </div>

        <p>Prepare Today, Protect Tomorrow. 🌱</p>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/components/WishlistToggle";
import { useCart } from "./CartProvider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { wishlistIds } = useWishlist();
  const { totalItems } = useCart();

  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold">
        safe<span className="text-[#76A65B]">Climate</span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden items-center gap-8 text-sm font-medium md:flex">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                isActive
                  ? "text-[#183B2B] font-semibold"
                  : "text-gray-500 hover:text-[#183B2B]"
              }`}
            >
              <span>{link.name}</span>

              {link.name === "Wishlist" && wishlistIds.length > 0 && (
                <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-500">
                  {wishlistIds.length}
                </span>
              )}
              
              {link.name === "Cart" && totalItems > 0 && (
                <span className="ml-1 rounded-full bg-[#E5EEDB] px-2 py-0.5 text-xs font-bold text-[#527C3E]">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        href="/products"
        className="rounded-full bg-[#183B2B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#28583E]"
      >
        Explore Products ↗
      </Link>
    </nav>
  );
}

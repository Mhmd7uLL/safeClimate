"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useWishlist } from "@/components/WishlistToggle";
import { useCart } from "./CartProvider";

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
];

const secondaryLinks = [
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
  { name: "Order History", href: "/orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { wishlistIds } = useWishlist();
  const { totalItems } = useCart();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
      {/* Logo */}
      <Link
        href="/"
        onClick={closeMenu}
        className="shrink-0 text-2xl font-bold"
      >
        safe<span className="text-[#76A65B]">Climate</span>
      </Link>

      {/* Primary Navigation - Desktop */}
      <div className="hidden items-center gap-8 text-sm font-medium md:flex">
        {primaryLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                isActive
                  ? "font-semibold text-[#183B2B]"
                  : "text-gray-500 hover:text-[#183B2B]"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
        className="flex h-11 w-11 items-center justify-center rounded-full text-[#183B2B] transition hover:bg-[#E5EEDB]"
      >
        {isMenuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
        )}
      </button>

      {/* Background Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-xl font-bold text-[#183B2B]">Menu</h2>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-[#183B2B]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Primary Navigation - Mobile Only */}
          <div className="border-b border-gray-100 pb-5 md:hidden">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Navigation
            </p>

            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`block rounded-lg px-3 py-3 text-sm transition ${
                  pathname === link.href
                    ? "bg-[#E5EEDB] font-semibold text-[#183B2B]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="mt-2">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Your Account
            </p>

            {secondaryLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#E5EEDB] font-semibold text-[#183B2B]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{link.name}</span>

                  {link.name === "Wishlist" && wishlistIds.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-500">
                      {wishlistIds.length}
                    </span>
                  )}

                  {link.name === "Cart" && totalItems > 0 && (
                    <span className="rounded-full bg-[#E5EEDB] px-2 py-0.5 text-xs font-bold text-[#527C3E]">
                      {totalItems}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-6">
          <p className="text-center text-xs text-gray-400">
            safeClimate — Prepare Today, Protect Tomorrow.
          </p>
        </div>
      </aside>
    </nav>
  );
}

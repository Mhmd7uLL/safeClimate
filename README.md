# 🌱 safeClimate

Website e-commerce yang menyediakan berbagai produk untuk membantu masyarakat menghadapi perubahan iklim, meningkatkan kesiapsiagaan terhadap bencana alam, serta mendukung gaya hidup yang lebih ramah lingkungan.

## Fitur 

- **Home** – Halaman utama yang memperkenalkan safeClimate dan menampilkan produk unggulan.
- **Products** – Katalog produk yang dilengkapi fitur pencarian dan filter kategori.
- **Product Detail** – Menampilkan informasi dan deskripsi setiap produk.
- **Wishlist** – Menyimpan produk favorit agar mudah ditemukan kembali.
- **Shopping Cart** – Mengelola produk yang ingin dibeli, termasuk mengatur kuantitas dan menghitung subtotal.
- **About** – Menampilkan informasi mengenai safeClimate.

## Kategori Produk

Produk safeClimate dikelompokkan ke dalam beberapa kategori:

1. Emergency
2. Flood Protection
3. Heat Protection
4. Water Sustainability

Website menyediakan minimal 20 produk yang dapat dijelajahi oleh pengunjung.

## Teknologi yang Digunakan

- **Next.js** – Framework pengembangan website berbasis React.
- **TypeScript** – Menambahkan sistem tipe data pada JavaScript.
- **Tailwind CSS** – Mengatur tampilan dan desain website.
- **PostgreSQL** - Database

## Struktur Folder

```text
safeclimate/
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── products/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── wishlist/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCatalog.tsx
│   ├── WishlistProvider.tsx
│   ├── CartProvider.tsx
│   └── AddToCartButton.tsx
│
├── data/
│   └── products.ts
│
├── public/
├── package.json
└── README.md
```

## Cara Menjalankan Proyek

Pastikan Node.js dan npm sudah terpasang pada perangkat.

**1. Clone repository**

```bash
git clone https://github.com/USERNAME/safeclimate.git
```

**2. Masuk ke direktori proyek**

```bash
cd safeclimate
```

**3. Instal dependensi**

```bash
npm install
```

**4. Jalankan development server**

```bash
npm run dev
```

**5. Buka website**

Akses alamat berikut melalui browser:

```text
http://localhost:3000
```

## 🌍 Isu Global dan SDGs

safeClimate mengangkat isu perubahan iklim (*Climate Change*) yang berkaitan dengan beberapa tujuan Sustainable Development Goals (SDGs), terutama:

- **SDG 11 – Sustainable Cities and Communities:** Mendukung kesiapsiagaan masyarakat dalam menghadapi bencana.
- **SDG 12 – Responsible Consumption and Production:** Mendorong konsumsi produk yang lebih bertanggung jawab.
- **SDG 13 – Climate Action:** Meningkatkan kesadaran dan tindakan dalam menghadapi perubahan iklim.

## 📌 Status Pengembangan

Proyek masih dalam tahap pengembangan. Beberapa fitur yang telah dibangun meliputi halaman utama, katalog produk, detail produk, Wishlist, dan Shopping Cart.

Fitur Checkout dan pengembangan lanjutan direncanakan pada tahap berikutnya.

---

**safeClimate – Prepare Today, Protect Tomorrow.** 🌱
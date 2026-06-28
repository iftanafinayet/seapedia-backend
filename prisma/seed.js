import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.driverEarning.deleteMany();
  await prisma.deliveryJob.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.applicationReview.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("User1234", 12);

  // Admin
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@seapedia.com",
      password: hashedPassword,
      roles: ["Admin"],
    },
  });

  // Sellers
  const seller1 = await prisma.user.create({
    data: {
      username: "seller1",
      email: "seller1@seapedia.com",
      password: userPassword,
      roles: ["Seller"],
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      username: "seller2",
      email: "seller2@seapedia.com",
      password: userPassword,
      roles: ["Seller"],
    },
  });

  // Buyers
  const buyer1 = await prisma.user.create({
    data: {
      username: "buyer1",
      email: "buyer1@seapedia.com",
      password: userPassword,
      roles: ["Buyer"],
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      username: "buyer2",
      email: "buyer2@seapedia.com",
      password: userPassword,
      roles: ["Buyer"],
    },
  });

  // Driver
  const driver1 = await prisma.user.create({
    data: {
      username: "driver1",
      email: "driver1@seapedia.com",
      password: userPassword,
      roles: ["Driver"],
    },
  });

  // Stores
  const store1 = await prisma.store.create({
    data: { name: "Toko Elektronik Jaya", sellerId: seller1.id },
  });
  const store2 = await prisma.store.create({
    data: { name: "Fashion Hub Surabaya", sellerId: seller2.id },
  });

  // Products by Category (5 per category, 35 total)
  const seedProducts = [
    // ── BEAUTY ──
    { name: "Serum Wajah Vitamin C", desc: "Brightening serum dengan 20% Vitamin C, hyaluronic acid, dan niacinamide", price: 89000, stock: 120, storeId: store1.id, category: "Beauty", ratings: [5,5,4,5,4] },
    { name: "Lipstik Matte Velvet", desc: "Long-lasting matte lipstik, 12 jam tahan lama, 6 pilihan warna", price: 45000, stock: 200, storeId: store1.id, category: "Beauty", ratings: [4,5,4,4,5] },
    { name: "Masker Wajah Aloe Vera", desc: "Sheet mask dengan ekstrak aloe vera, melembabkan dan menenangkan kulit", price: 15000, stock: 300, storeId: store1.id, category: "Beauty", ratings: [4,4,5,4,4] },
    { name: "Parfum Eau de Toilette", desc: "Aroma floral-fresh yang elegan, 50ml, cocok untuk daily wear", price: 150000, stock: 80, storeId: store1.id, category: "Beauty", ratings: [5,5,5,4,5] },
    { name: "Sunscreen SPF 50 PA+++", desc: "Tabir surya ringan, non-greasy, melindungi dari UVA/UVB", price: 65000, stock: 150, storeId: store1.id, category: "Beauty", ratings: [5,4,5,5,4] },

    // ── FASHION ──
    { name: "Jaket Denim Premium", desc: "High-quality raw denim jacket, classic fit, unisex", price: 450000, stock: 60, storeId: store2.id, category: "Fashion", ratings: [5,4,4,5,4] },
    { name: "Kemeja Flanel Kotak", desc: "Kemeja flanel katun premium, nyaman dipakai sehari-hari", price: 120000, stock: 90, storeId: store2.id, category: "Fashion", ratings: [4,5,5,4,5] },
    { name: "Celana Chino Slim Fit", desc: "Celana chino stretch fabric, slim fit, cocok casual & semi-formal", price: 180000, stock: 75, storeId: store2.id, category: "Fashion", ratings: [5,5,4,4,4] },
    { name: "Kaos Polos Premium", desc: "Kaos katun combed 30s, nyaman, tidak mudah melar, 10 warna", price: 55000, stock: 250, storeId: store2.id, category: "Fashion", ratings: [4,4,5,4,5] },
    { name: "Dress Batik Modern", desc: "Dress batik kombinasi modern, cocok untuk acara formal & casual", price: 280000, stock: 40, storeId: store2.id, category: "Fashion", ratings: [5,5,5,5,4] },

    // ── ELECTRONIC ──
    { name: "Smartphone Android 12", desc: "Layar AMOLED 6.5\", 8GB RAM, 128GB ROM, kamera 50MP", price: 3200000, stock: 45, storeId: store1.id, category: "Electronic", ratings: [5,4,5,5,4] },
    { name: "Laptop Ultrabook 14\"", desc: "Intel i5 Gen 13, 16GB RAM, 512GB SSD, 1.2kg", price: 8500000, stock: 25, storeId: store1.id, category: "Electronic", ratings: [5,5,4,4,5] },
    { name: "Wireless Earbuds ANC", desc: "Active noise cancelling, 30 jam battery, IPX5 waterproof", price: 450000, stock: 100, storeId: store1.id, category: "Electronic", ratings: [4,5,4,4,5] },
    { name: "Smartwatch Health Pro", desc: "AMOLED, heart rate, SpO2, GPS, sleep tracking, 14 hari battery", price: 1500000, stock: 60, storeId: store1.id, category: "Electronic", ratings: [5,5,5,4,4] },
    { name: "Power Bank 20000mAh", desc: "Fast charging 65W PD, 3 port output, LCD display", price: 250000, stock: 200, storeId: store1.id, category: "Electronic", ratings: [4,4,5,4,3] },

    // ── GROCERY ──
    { name: "Beras Premium 5kg", desc: "Beras organik kualitas premium, pulen dan wangi", price: 75000, stock: 200, storeId: store2.id, category: "Grocery", ratings: [5,5,4,5,5] },
    { name: "Minyak Goreng 2L", desc: "Minyak goreng sawit premium, mengandung vitamin A", price: 35000, stock: 300, storeId: store2.id, category: "Grocery", ratings: [4,4,5,4,4] },
    { name: "Kopi Arabika Gayo 250g", desc: "Kopi single origin Aceh Gayo, medium roast, bubuk halus", price: 65000, stock: 150, storeId: store2.id, category: "Grocery", ratings: [5,5,5,4,5] },
    { name: "Susu UHT Full Cream 1L", desc: "Susu sapi segar UHT, tinggi kalsium, kemasan 1 liter", price: 22000, stock: 250, storeId: store2.id, category: "Grocery", ratings: [4,4,4,5,4] },
    { name: "Madu Murni 500ml", desc: "Madu hutan asli, tanpa tambahan gula, kaya antioksidan", price: 85000, stock: 100, storeId: store2.id, category: "Grocery", ratings: [5,5,5,5,5] },

    // ── HOME ──
    { name: "Set Sprei Katun 3pcs", desc: "Sprei katun premium 180x200cm + 2 sarung bantal, adem & lembut", price: 180000, stock: 80, storeId: store1.id, category: "Home", ratings: [5,4,5,5,4] },
    { name: "Rak Sepatu Minimalis", desc: "Rak sepatu 4 tingkat, material plastik ABS kuat, muat 16 pasang", price: 95000, stock: 120, storeId: store1.id, category: "Home", ratings: [4,5,4,4,5] },
    { name: "Lampu Meja LED", desc: "Lampu belajar LED eye-care, 3 mode warna, adjustable brightness", price: 125000, stock: 90, storeId: store1.id, category: "Home", ratings: [5,5,4,5,5] },
    { name: "Botol Minum Stainless 750ml", desc: "Insulated stainless steel, tahan panas & dingin 12 jam", price: 75000, stock: 180, storeId: store1.id, category: "Home", ratings: [4,4,5,4,4] },
    { name: "Set Alat Masak Silikon", desc: "Spatula, sendok, sutil silikon food-grade, tahan panas 250°C", price: 55000, stock: 140, storeId: store1.id, category: "Home", ratings: [5,4,5,4,5] },

    // ── SPORT ──
    { name: "Sepatu Lari Carbon Plate", desc: "Sepatu lari dengan carbon plate, ringan 220g, responsif", price: 1200000, stock: 50, storeId: store2.id, category: "Sport", ratings: [5,5,5,4,5] },
    { name: "Yoga Mat Premium 6mm", desc: "Matras yoga anti-slip, 6mm tebal, 183x61cm, bonus carrying strap", price: 150000, stock: 100, storeId: store2.id, category: "Sport", ratings: [4,5,4,4,5] },
    { name: "Dumbbell Set 20kg", desc: "Set dumbbell adjustable 2x10kg, neoprene coating, anti slip", price: 380000, stock: 40, storeId: store2.id, category: "Sport", ratings: [5,4,4,5,4] },
    { name: "Jersey Sepeda Premium", desc: "Cycling jersey breathable, UV protection, 3 back pockets", price: 250000, stock: 65, storeId: store2.id, category: "Sport", ratings: [5,5,4,4,5] },
    { name: "Tali Skipping Digital", desc: "Jump rope dengan counter digital, bearing halus, adjustable length", price: 85000, stock: 200, storeId: store2.id, category: "Sport", ratings: [4,4,5,4,4] },

    // ── GENERAL ── (bonus)
    { name: "Paket Hadiah Mystery Box", desc: "Mystery box berisi 3-5 item random berbagai kategori, surprise!", price: 100000, stock: 50, storeId: store1.id, category: "General", ratings: [4,5,5,4,5] },
  ];

  const createdProducts = [];
  for (const p of seedProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        stock: p.stock,
        storeId: p.storeId,
        category: p.category,
      },
    });
    createdProducts.push(product);

    // Create reviews for each product
    const reviewerNames = ["Budi Santoso", "Sari Putri", "Dedi Pratama", "Anisa Rahma", "Rizky Fajar"];
    const reviewComments = [
      "Produk sangat berkualitas, sesuai dengan deskripsi. Pengiriman cepat!",
      "Barang bagus banget, recommended seller! Packing aman.",
      "Harga sesuai kualitas, puas banget belanja disini.",
      "Ini pembelian kedua saya, gak pernah kecewa. Mantap!",
      "Produk original, kualitas premium. Akan beli lagi.",
    ];

    for (let i = 0; i < p.ratings.length; i++) {
      await prisma.productReview.create({
        data: {
          productId: product.id,
          reviewerName: reviewerNames[i],
          rating: p.ratings[i],
          comment: reviewComments[i],
        },
      });
    }
  }

  // Use first few products as refs for orders
  const products1 = createdProducts.filter(p => p.storeId === store1.id).slice(0, 3);
  const products2 = createdProducts.filter(p => p.storeId === store2.id).slice(0, 3);

  // Wallets
  await prisma.wallet.create({
    data: { userId: buyer1.id, balance: 5000000 },
  });

  await prisma.wallet.create({
    data: { userId: buyer2.id, balance: 3000000 },
  });

  // Addresses for buyer1
  await prisma.address.createMany({
    data: [
      {
        userId: buyer1.id,
        label: "Rumah",
        recipient: "Budi Santoso",
        phone: "081234567890",
        addressLine: "Jl. Merdeka No. 123, RT 01 RW 02",
        city: "Jakarta Selatan",
        postalCode: "12345",
        isPrimary: true,
      },
      {
        userId: buyer1.id,
        label: "Kantor",
        recipient: "Budi Santoso",
        phone: "081234567891",
        addressLine: "Jl. Sudirman Kav. 45, Lantai 20",
        city: "Jakarta Pusat",
        postalCode: "10220",
        isPrimary: false,
      },
    ],
  });

  // Addresses for buyer2
  await prisma.address.create({
    data: {
      userId: buyer2.id,
      label: "Rumah",
      recipient: "Siti Rahayu",
      phone: "089876543210",
      addressLine: "Jl. Melati No. 45, Komplek Anggrek",
      city: "Bandung",
      postalCode: "40123",
      isPrimary: true,
    },
  });

  // Vouchers
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  await prisma.voucher.create({
    data: {
      code: "HEMAT50",
      discountType: "Percentage",
      discountValue: 10,
      minOrder: 500000,
      expiryDate: futureDate,
      usageLimit: 100,
      usedCount: 0,
      createdBy: admin.id,
    },
  });

  await prisma.voucher.create({
    data: {
      code: "FLAT50K",
      discountType: "Fixed",
      discountValue: 50000,
      minOrder: 200000,
      expiryDate: futureDate,
      usageLimit: 50,
      usedCount: 0,
      createdBy: admin.id,
    },
  });

  // Promos
  await prisma.promo.create({
    data: {
      code: "GRANDLAUNCH",
      discountType: "Percentage",
      discountValue: 20,
      minOrder: 1000000,
      expiryDate: futureDate,
      createdBy: admin.id,
    },
  });

  // Application Reviews
  await prisma.applicationReview.create({
    data: {
      reviewerName: "Andi Pratama",
      rating: 5,
      comment: "Aplikasi marketplace terbaik! Barang cepat sampai dan kualitas terjamin.",
      userId: buyer1.id,
    },
  });

  await prisma.applicationReview.create({
    data: {
      reviewerName: "Siti Nurhaliza",
      rating: 4,
      comment: "Bagus banget pilihan produknya, banyak yang menarik. Pengiriman agak lama dikit.",
    },
  });

  console.log("Seed completed successfully!");
  console.log("");
  console.log("Demo accounts:");
  console.log("  Admin  - username: admin    password: admin123");
  console.log("  Seller1 - username: seller1  password: User1234");
  console.log("  Seller2 - username: seller2  password: User1234");
  console.log("  Buyer1  - username: buyer1   password: User1234 (saldo: 5,000,000)");
  console.log("  Buyer2  - username: buyer2   password: User1234 (saldo: 3,000,000)");
  console.log("  Driver1 - username: driver1  password: User1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

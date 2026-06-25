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
    data: {
      name: "Toko Elektronik Jaya",
      sellerId: seller1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Fashion Hub",
      sellerId: seller2.id,
    },
  });

  // Products - Store 1 (Elektronik: 5) + Store 2 (Fashion: 5)
  const seedProducts = [
    // Elektronik (store1): Smartphone, Laptop, Audio, Wearable, Accessories
    { name: "Smartphone X Pro", desc: "Latest flagship smartphone with advanced camera 108MP, OLED 120Hz", price: 8500000, stock: 50, storeId: store1.id, category: "SMARTPHONE", ratings: [5,4,5,5,4] },
    { name: "Laptop Ultrabook 14", desc: "Lightweight laptop 1.2kg, 16GB RAM, 512GB SSD", price: 12500000, stock: 30, storeId: store1.id, category: "LAPTOP", ratings: [5,5,4,4,5] },
    { name: "Wireless Earbuds Pro", desc: "Active noise-cancelling, 30hr battery, IPX5 waterproof", price: 750000, stock: 100, storeId: store1.id, category: "AUDIO", ratings: [4,5,4,4,5] },
    { name: "Smartwatch Active 2", desc: "AMOLED display, heart rate, SpO2, GPS, 14-day battery", price: 2200000, stock: 45, storeId: store1.id, category: "WEARABLE", ratings: [5,5,5,4,4] },
    { name: "USB-C Hub 7-in-1", desc: "HDMI 4K, SD card, USB 3.0, PD charging passthrough", price: 350000, stock: 150, storeId: store1.id, category: "ACCESSORIES", ratings: [4,4,5,4,3] },

    // Fashion (store2): Clothing, Footwear, Bag, Accessories, Outerwear
    { name: "Jaket Denim Premium", desc: "High-quality raw denim jacket, classic fit", price: 450000, stock: 80, storeId: store2.id, category: "CLOTHING", ratings: [5,4,4,5,4] },
    { name: "Sepatu Sneakers Casual", desc: "Comfortable casual sneakers, memory foam insole", price: 350000, stock: 60, storeId: store2.id, category: "FOOTWEAR", ratings: [4,5,5,4,5] },
    { name: "Tas Ransel Fashion", desc: "Stylish backpack with laptop compartment, water-repellent", price: 250000, stock: 40, storeId: store2.id, category: "BAG", ratings: [5,4,4,4,5] },
    { name: "Kacamata UV Premium", desc: "Polarized UV400 lenses, lightweight titanium frame", price: 180000, stock: 90, storeId: store2.id, category: "ACCESSORIES", ratings: [4,5,5,4,4] },
    { name: "Hoodie Graphic Limited", desc: "Limited edition graphic hoodie, 100% cotton fleece", price: 320000, stock: 55, storeId: store2.id, category: "OUTERWEAR", ratings: [5,5,4,5,5] },
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

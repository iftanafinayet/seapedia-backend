import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Create ProductReview table via raw SQL
await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "ProductReview" (
    "id" SERIAL PRIMARY KEY,
    "productId" INTEGER NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "userId" INTEGER REFERENCES "User"("id"),
    "reviewerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS "ProductReview_productId_idx" ON "ProductReview"("productId");
`);

console.log("ProductReview table created!");
await prisma.$disconnect();

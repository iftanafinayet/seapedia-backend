import prisma from "../config/prisma.js";

export async function getProductReviews(productId) {
  return prisma.productReview.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProductReview({ productId, userId, reviewerName, rating, comment }) {
  return prisma.productReview.create({
    data: { productId, userId, reviewerName, rating, comment },
  });
}

export async function getTopRatedProducts(limit = 4) {
  const reviews = await prisma.productReview.groupBy({
    by: ["productId"],
    _avg: { rating: true },
    _count: { rating: true },
    orderBy: { _avg: { rating: "desc" } },
    take: limit,
  });

  const ids = reviews.map(r => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { store: { select: { id: true, name: true } } },
  });

  return products.map(p => {
    const rev = reviews.find(r => r.productId === p.id);
    return {
      ...p,
      avgRating: rev?._avg?.rating || 0,
      reviewCount: rev?._count?.rating || 0,
    };
  }).sort((a, b) => b.avgRating - a.avgRating);
}

// Application Reviews
export async function getReviews() {
  return prisma.applicationReview.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview({ reviewerName, rating, comment, userId }) {
  return prisma.applicationReview.create({
    data: { reviewerName, rating, comment, userId },
  });
}

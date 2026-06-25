import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError, ConflictError } from "../utils/errors.js";

const DRIVER_EARNING_RATE = 0.5; // 50% of delivery fee

export async function getAvailableJobs() {
  return prisma.deliveryJob.findMany({
    where: {
      status: "Available",
      order: { status: "MenungguPengirim" },
    },
    include: {
      order: {
        select: {
          id: true,
          deliveryMethod: true,
          deliveryFee: true,
          store: { select: { id: true, name: true } },
          address: {
            select: { addressLine: true, city: true, postalCode: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getJobDetail(jobId) {
  const job = await prisma.deliveryJob.findUnique({
    where: { id: jobId },
    include: {
      order: {
        include: {
          store: { select: { id: true, name: true } },
          address: true,
          buyer: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!job) throw new NotFoundError("Delivery job not found");
  return job;
}

export async function takeJob({ driverId, jobId }) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.deliveryJob.findUnique({ where: { id: jobId } });

    if (!job) throw new NotFoundError("Delivery job not found");
    if (job.status !== "Available") {
      throw new ConflictError("This job is no longer available");
    }

    const updatedJob = await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        driverId,
        status: "Taken",
        takenAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: job.orderId },
      data: {
        status: "SedangDikirim",
        statusHistory: {
          create: { status: "SedangDikirim", notes: "Driver picked up the order" },
        },
      },
    });

    return updatedJob;
  });
}

export async function completeJob({ driverId, jobId }) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.deliveryJob.findUnique({
      where: { id: jobId },
      include: { order: true },
    });

    if (!job) throw new NotFoundError("Delivery job not found");
    if (job.driverId !== driverId) throw new BadRequestError("This is not your job");
    if (job.status !== "Taken") {
      throw new BadRequestError("Job is not in 'Taken' status");
    }

    await tx.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: "Delivered",
        completedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: job.orderId },
      data: {
        status: "PesananSelesai",
        statusHistory: {
          create: {
            status: "PesananSelesai",
            notes: "Driver delivered the order",
          },
        },
      },
    });

    const earningAmount = job.order.deliveryFee * DRIVER_EARNING_RATE;

    await tx.driverEarning.create({
      data: {
        driverId,
        orderId: job.orderId,
        amount: parseFloat(earningAmount.toFixed(2)),
      },
    });

    return { message: "Delivery completed", earned: parseFloat(earningAmount.toFixed(2)) };
  });
}

export async function getDriverEarnings(driverId) {
  const earnings = await prisma.driverEarning.findMany({
    where: { driverId },
    include: {
      order: {
        select: { id: true, deliveryFee: true, deliveryMethod: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  return {
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    totalJobs: earnings.length,
    earnings,
  };
}

export async function getMyJobs(driverId) {
  return prisma.deliveryJob.findMany({
    where: { driverId },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          deliveryMethod: true,
          deliveryFee: true,
          store: { select: { id: true, name: true } },
          address: { select: { addressLine: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

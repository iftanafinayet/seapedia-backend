import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateAuthToken } from "../utils/token.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors.js";

export async function register({ username, email, password, roles }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    if (existing.username === username) {
      throw new ConflictError("Username already taken");
    }
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      roles,
    },
  });

  const token = generateAuthToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token,
  };
}

export async function login({ identifier, password }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateAuthToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token,
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      roles: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return user;
}

export async function setActiveRole(userId, activeRole) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (activeRole !== "Admin" && !user.roles.includes(activeRole)) {
    throw new BadRequestError(`You do not have the role '${activeRole}'`);
  }

  return { activeRole };
}

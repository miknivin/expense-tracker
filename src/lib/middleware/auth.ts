import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

export async function isAuthenticatedUser(req: NextRequest): Promise<User> {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    throw new Error("You need to login to access this resource");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-jwt-secret") as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    throw new Error("User not found. Please login again.");
  }

  return user;
}

export function authorizeRoles(user: User, ...roles: string[]): void {
  if (!roles.includes(user.role)) {
    throw new Error("Not authorized for this role");
  }
}
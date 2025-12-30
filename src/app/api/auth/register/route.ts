import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().max(100, "Name must be 100 characters or less").optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = schema.parse(body);

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "VIEWER" },
    });

    return NextResponse.json(
      { message: "User created", user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );

  } catch (error:any) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
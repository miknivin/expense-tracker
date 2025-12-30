import { NextResponse } from "next/server";


import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({

  email: z.string().email("Invalid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),

});

export async function POST(request: Request) {

  try {

    const body = await request.json();
    const { email, password } = schema.parse(body);

    // Find user

    const user = await prisma.user.findUnique({

      where: { email },

    });

    if (!user || !user.password) {

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    }

    // Verify password

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    }

    // Generate JWT

    const token = jwt.sign(

      { id: user.id, email: user.email, role: user.role },

      process.env.JWT_SECRET || "your-jwt-secret",

      { expiresIn: "7d" }

    );

    // Set cookie options

    const cookieOptions = {

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax" as const,

      maxAge: 7 * 24 * 60 * 60, // 7 days

      path: "/",

    };

    // Create response

    const response = NextResponse.json({

      success: true,

      token,

      user: {

        id: user.id,

        name: user.name || "",

        email: user.email,

        role: user.role,

      },

    }, { status: 200 });

    // Set cookie

    response.headers.set(

      "Set-Cookie",

      `token=${token}; HttpOnly; Path=/; Max-Age=${cookieOptions.maxAge}; SameSite=${cookieOptions.sameSite}${cookieOptions.secure ? "; Secure" : ""}`

    );

    return response;

  } catch (error) {

    console.error("Login error:", error);

    if (error instanceof z.ZodError) {

      return NextResponse.json({ error: error.issues.map((e) => e.message).join(", ") }, { status: 400 });

    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });

  }

}
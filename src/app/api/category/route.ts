// app/api/categories/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Fetch all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation (name must be unique)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
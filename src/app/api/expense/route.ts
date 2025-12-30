// app/api/expenses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust if your prisma import is different
import { isAuthenticatedUser } from '@/lib/middleware/auth';
import { ExpenseFilters } from '@/lib/filters/ExpenseFilters';

export async function GET(request: NextRequest) {
  try {
    // 1. Require authentication
    const user = await isAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);

    // 3. Build filters with pagination & sorting
    const filters = new ExpenseFilters(query);

    // 4. Fetch expenses and total count in parallel
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany(
        filters.getFindManyArgs({
          category: true,
          user: { select: { id: true, name: true, email: true } },
        })
      ),
      prisma.expense.count({ where: filters.toPrismaWhere() }),
    ]);

    // 5. Get pagination metadata
    const pagination = await filters.getPaginationMetadata(totalCount);

    // 6. Return structured response
    return NextResponse.json(
      {
        expenses,
        pagination,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching expenses:', error);

    // Handle auth-related errors from isAuthenticatedUser
    if (error.message?.includes('login') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await isAuthenticatedUser(request);

    // Optional: Restrict creating expenses to specific roles
    // authorizeRoles(user, 'ADMIN', 'SUPER_ADMIN', 'VIEWER'); // Allow VIEWER too if needed
    // authorizeRoles(user, 'ADMIN', 'SUPER_ADMIN'); // Stricter: only admins

    const body = await request.json();

    const {
      date,
      description,
      amount,
      billPhoto,
      categoryId,
    } = body;

    // Validation
    if (!date || !description || !amount || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: date, description, amount, categoryId' },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        description: description.trim(),
        amount: parsedAmount,
        billPhoto: billPhoto || null,
        userId: user.id,        // Automatically assign to logged-in user
        categoryId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);

    if (error.message.includes('login') || error.message.includes('User not found')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('Not authorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Prisma foreign key error (invalid categoryId)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid categoryId' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
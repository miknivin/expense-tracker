// app/api/expenses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAuthenticatedUser } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
 context: { params: { id: string } }
) {
  try {
    const user = await isAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const { id } = params;

    // ← CRITICAL: Validate that id exists and is a string
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing expense ID' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.findUnique({
      where: { id }, // Now safe — id is guaranteed to be a string
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, description: true } },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    if (!isAdmin && expense.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ expense }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching expense:', error);

    if (error.message?.includes('login') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
 context: { params: { id: string } }
) {
  try {
    // 1. Require authentication
    const user = await isAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const { id } = params;
    const body = await request.json();

    const {
      date,
      description,
      amount,
      billPhoto,
      categoryId,
    } = body;

    // 2. Basic validation
    if (!date || !description || amount === undefined || !categoryId) {
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

    // 3. Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    if (!isAdmin && existingExpense.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot update others\' expenses' },
        { status: 403 }
      );
    }

    // 4. Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(date),
        description: description.trim(),
        amount: parsedAmount,
        billPhoto: billPhoto ?? null,
        categoryId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, description: true } },
      },
    });

    // 5. Success
    return NextResponse.json({ expense: updatedExpense }, { status: 200 });
  } catch (error: any) {
  
    // Auth errors
    if (error.message?.includes('login') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Foreign key violation (e.g., invalid categoryId)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid categoryId' },
        { status: 400 }
      );
    }

    // Record not found during update
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}


// NEW: DELETE handler
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const user = await isAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const params = await Promise.resolve(context.params);
    const { id } = params;

    // 2. Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing expense ID' },
        { status: 400 }
      );
    }

    // 3. Check ownership / admin rights
    const expense = await prisma.expense.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    if (!isAdmin && expense.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete others\' expenses' },
        { status: 403 }
      );
    }

    // 4. Perform deletion
    await prisma.expense.delete({
      where: { id },
    });

    // 5. Success response
    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting expense:', error);

    // Auth errors
    if (error.message?.includes('login') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Record not found during delete (Prisma throws P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
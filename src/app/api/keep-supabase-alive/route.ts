// app/api/keep-supabase-alive/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Upsert: Use a fixed ID (e.g., 1) so there's always only one row
    await prisma.heartbeat.upsert({
      where: { id: 1 },              // Look for row with id = 1
      update: {},                    // If exists → update pingedAt (thanks to @updatedAt)
      create: { id: 1 },             // If not → create it with id 1
    });

    // Alternative: If you prefer no fixed ID, use a unique dummy field
    // await prisma.heartbeat.upsert({
    //   where: { singleton: 'keep-alive' }, // Add a unique string field if needed
    //   update: {},
    //   create: { singleton: 'keep-alive' },
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Supabase kept alive with heartbeat upsert!',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Heartbeat upsert failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upsert heartbeat' },
      { status: 500 }
    );
  }
}

// Ensures fresh DB hit every time (no caching)
export const dynamic = 'force-dynamic';
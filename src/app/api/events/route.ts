// app/api/events/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { start: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('GET events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, start, end, allDay = true, calendar } = body;

    // Validate required fields
    if (!title || !start || !calendar) {
      return NextResponse.json(
        { error: 'Title, start date, and calendar are required' },
        { status: 400 }
      );
    }

    // Convert "YYYY-MM-DD" → full ISO string with midnight UTC
    const toDateTime = (dateStr: string) => `${dateStr}T00:00:00.000Z`;

    const createdEvent = await prisma.event.create({
      data: {
        title,
        start: toDateTime(start),
        end: end ? toDateTime(end) : null,
        allDay,
        calendar,
      },
    });

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    console.error('POST event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
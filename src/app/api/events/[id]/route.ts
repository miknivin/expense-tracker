// app/api/events/[id]/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Helper: Convert "YYYY-MM-DD" → "YYYY-MM-DD T00:00:00.000Z" (midnight UTC)
const toDateTime = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined; // Don't touch the field if not provided
  return `${dateStr}T00:00:00.000Z`;
};

// PATCH → Update an existing event
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { title, start, end, allDay, calendar } = body;

    const params = await Promise.resolve(context.params);
    const { id } = params;
    if (
      (title !== undefined && !title?.trim()) ||
      (calendar !== undefined && !calendar)
    ) {
      return NextResponse.json(
        { error: 'Title and calendar cannot be empty' },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: {
        title: title?.trim(),
        start: start !== undefined ? toDateTime(start) : undefined,
        end: end !== undefined ? (end ? toDateTime(end) : null) : undefined,
        allDay: allDay !== undefined ? allDay : undefined,
        calendar,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error('PATCH event error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE → Remove an event permanently
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;
    await prisma.event.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('DELETE event error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
// store/api/calendarApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the shape of an Event as returned from Prisma
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string, e.g., "2025-12-30"
  end?: string | null; // Optional, null if not set
  allDay: boolean;
  calendar: string; // "Danger" | "Success" | "Primary" | "Warning"
  createdAt: string;
  updatedAt: string;
}

export const calendarApi = createApi({
  reducerPath: 'calendarApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/events', // Matches your Next.js API routes
  }),
  tagTypes: ['Event'], // Used for cache invalidation
  endpoints: (builder) => ({
    // GET all events
    getEvents: builder.query<CalendarEvent[], void>({
      query: () => '',
      providesTags: (result) =>
        result
          ? // Successful query: tag each event + a list tag
            [
              ...result.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Event', id: 'LIST' },
            ]
          : [{ type: 'Event', id: 'LIST' }], // Fallback when no data
    }),

    // POST: Create new event
    addEvent: builder.mutation<CalendarEvent, Partial<CalendarEvent>>({
      query: (newEvent) => ({
        url: '',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: [{ type: 'Event', id: 'LIST' }], // Refetch full list after add
    }),

    // PATCH: Update existing event
    updateEvent: builder.mutation<
      CalendarEvent,
      { id: string } & Partial<CalendarEvent>
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }], // Invalidate specific event + list will refresh via other hooks
      // Also invalidate the list to ensure fresh data
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistic update (optional, but nice UX)
        const patchResult = dispatch(
          calendarApi.util.updateQueryData('getEvents', undefined, (draft) => {
            const event = draft.find((e) => e.id === id);
            if (event) Object.assign(event, patch);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo(); // Rollback on error
        }
      },
    }),

    // DELETE: Remove event
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          calendarApi.util.updateQueryData('getEvents', undefined, (draft) => {
            return draft.filter((e) => e.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = calendarApi;
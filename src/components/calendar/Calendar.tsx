"use client";
import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import {
  useGetEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  CalendarEvent as ApiEvent,
} from "@/redux/api/calendarApi";

interface FullCalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<FullCalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("primary");
  const [errorMessage, setErrorMessage] = useState(""); // ← NEW: Error state
  const { isOpen, openModal, closeModal } = useModal();

  // RTK Query hooks
  const { data: apiEvents = [], isLoading } = useGetEventsQuery();
  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Map Prisma events → FullCalendar format
  const events: FullCalendarEvent[] = apiEvents?.map((event: ApiEvent) => ({
    id: event.id,
    title: event.title,
    start: event.start.split("T")[0],
    end: event.end ? event.end.split("T")[0] : undefined,
    allDay: event.allDay,
    extendedProps: { calendar: event.calendar },
  }));

  const resetModalFieldsForNew = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Primary");
    setSelectedEvent(null);
    setErrorMessage(""); // ← Clear error
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFieldsForNew();
    setEventStartDate(selectInfo.startStr.split("T")[0]);
    setEventEndDate(selectInfo.endStr?.split("T")[0] || selectInfo.startStr.split("T")[0]);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const fcEvent = clickInfo.event;
    const event: FullCalendarEvent = {
      id: fcEvent.id,
      title: fcEvent.title || "",
      start: fcEvent.startStr.split("T")[0],
      end: fcEvent.endStr?.split("T")[0],
      allDay: fcEvent.allDay ?? true,
      extendedProps: { calendar: fcEvent.extendedProps.calendar as string },
    };
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventStartDate(event.start);
    setEventEndDate(event.end || "");
    setEventLevel(event.extendedProps.calendar);
    setErrorMessage(""); // ← Clear error
    openModal();
  };

  const handleSave = async () => {
    if (!eventTitle.trim() || !eventLevel) {
      setErrorMessage("Title and color are required"); // ← Show in modal
      return;
    }
    setErrorMessage(""); // ← Clear previous error

    const eventData = {
      title: eventTitle.trim(),
      start: eventStartDate,
      end: eventEndDate || null,
      allDay: true,
      calendar: eventLevel,
    };

    try {
      if (selectedEvent) {
        await updateEvent({ id: selectedEvent.id, ...eventData }).unwrap();
      } else {
        await addEvent(eventData).unwrap();
      }
      closeModal();
      resetModalFieldsForNew();
    } catch (err: any) {
      console.error("Failed to save event:", err);
      setErrorMessage(err?.data?.message || "Failed to save event. Check console."); // ← Show in modal
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(selectedEvent.id).unwrap();
      closeModal();
      resetModalFieldsForNew();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      setErrorMessage(err?.data?.message || "Failed to delete event."); // ← Show in modal
    }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
    setErrorMessage(""); // ← Clear error
  };

  const openAddModal = () => {
    resetModalFieldsForNew();
    openModal();
  };

  const handleCloseModal = () => {
    setErrorMessage(""); // ← Clear error on close
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/3">
        Loading events...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="custom-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openAddModal,
            },
          }}
        />
      </div>
      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Edit Event" : "Add Event"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Schedule or edit an event on the calendar
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key]) => (
                  <label key={key} className="flex items-center text-sm cursor-pointer text-gray-700 dark:text-gray-400">
                    <input
                      type="radio"
                      name="event-level"
                      value={key}
                      checked={eventLevel === key}
                      onChange={() => setEventLevel(key)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full dark:border-gray-700">
                      <span
                        className={`h-2 w-2 rounded-full bg-white ${
                          eventLevel === key ? "block" : "hidden"
                        }`}
                      />
                    </span>
                    {key}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Start Date
              </label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker()}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                End Date (optional)
              </label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker()}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
              />
            </div>
          </div>
          {/* ← NEW: Error display (no styling classes changed) */}
          {errorMessage && (
            <div className="mt-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-nowrap w-full justify-between items-center">
            <div className="mt-8">
                  {selectedEvent && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 mt-8 sm:justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                Cancel
              </button>
        
              <button
                onClick={handleSave}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                {selectedEvent ? "Update" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const color = (eventInfo.event.extendedProps?.calendar as string)?.toLowerCase() || "primary";
  const colorClass = `fc-bg-${color}`;
  return (
    <div className={`event-fc-color flex fc-event-main p-1 rounded-sm ${colorClass}`}>
      <div className="fc-daygrid-event-dot" />
      <div className="fc-event-time text-xs">{eventInfo.timeText}</div>
      <div className="fc-event-title truncate text-xs font-medium">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
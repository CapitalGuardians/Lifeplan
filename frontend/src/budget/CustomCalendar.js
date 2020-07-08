import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";

export default function CustomCalendar(props) {
  const { newEvents } = props;

  return (
    <FullCalendar
      defaultView="dayGridMonth"
      plugins={[dayGridPlugin]}
      events={newEvents}
      height={"auto"}
      fixedWeekCount={false}
    />
  );
}

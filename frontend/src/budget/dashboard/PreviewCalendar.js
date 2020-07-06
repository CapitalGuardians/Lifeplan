import React from "react";
import { getDay, getDaysInMonth, getMonth, startOfMonth } from "date-fns";
import styles from "./PreviewCalendar.module.css";
import { Card, CardContent } from "@material-ui/core";

export default function PreviewCalendar(props) {
  const { showPreview, startDate, supportGroups } = props;
  console.log(showPreview);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  return (
    <div className={styles.calendarContainer}>
      {showPreview === true && (
        <Card className={styles.card}>
          <CardContent>Core: $100 Capacity: $200 Capital: $300</CardContent>
        </Card>
      )}

      <div className={styles.month}>{months[getMonth(startDate)]}</div>
      <table className={styles.calendar}>
        <thead>
          <tr className="calendar-header"></tr>
        </thead>
        <tbody>
          <tr>{renderWeekdays()}</tr>
          {renderDays(startDate)}
        </tbody>
      </table>
    </div>
  );
}

const renderWeekdays = () => {
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return weekdays.map(weekday => {
    return (
      <td key={weekday} className={styles.weekday}>
        {weekday}
      </td>
    );
  });
};

const renderDays = date => {
  const startDay = getDay(startOfMonth(date));
  const days = [];
  const daysInMonth = getDaysInMonth(date);
  for (let i = 0; i < startDay; i++) {
    days.push(<td key={i} className="empty-day" />);
  }
  for (let i = 1; i < daysInMonth + 1; i++) {
    days.push(
      <td key={i + startDay - 1} className={styles.day}>
        {i}
      </td>
    );
  }
  const rows = [];
  for (let i = 0; i < days.length % 7; i++) {
    rows.push(<tr key={i}>{days.slice(i * 7, (i + 1) * 7)}</tr>);
  }
  return rows;
};
